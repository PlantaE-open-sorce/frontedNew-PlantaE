import { Component, Input, Output, EventEmitter, forwardRef, signal, computed, HostListener, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

export interface AutocompleteOption {
    id: string;
    label: string;
    [key: string]: unknown;
}

@Component({
    selector: 'app-autocomplete',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './autocomplete.component.html',
    styleUrls: ['./autocomplete.component.css'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AutocompleteComponent),
            multi: true
        }
    ]
})
export class AutocompleteComponent implements ControlValueAccessor, OnChanges {
    @Input() options: AutocompleteOption[] = [];
    @Input() placeholder = 'Buscar...';
    @Input() displayField = 'label';
    @Input() valueField = 'id';
    @Input() emptyMessage = 'Sin resultados';
    @Input() allowCustom = false;

    @Output() optionSelected = new EventEmitter<AutocompleteOption | null>();

    readonly searchTerm = signal('');
    readonly isOpen = signal(false);
    readonly highlightedIndex = signal(-1);
    private readonly internalValue = signal<string | null>(null);
    private readonly optionsSignal = signal<AutocompleteOption[]>([]);

    private onChange: (value: string | null) => void = () => { };
    private onTouched: () => void = () => { };
    private isSelecting = false;

    constructor(private readonly elementRef: ElementRef) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['options']) {
            this.optionsSignal.set(this.options || []);
            // Si tenemos un valor y ahora llegaron las opciones, actualizar el display
            const currentValue = this.internalValue();
            if (currentValue && this.options?.length) {
                const option = this.options.find(o => String(o[this.valueField]) === currentValue);
                if (option) {
                    this.searchTerm.set(String(option[this.displayField]));
                }
            }
        }
    }

    readonly filteredOptions = computed(() => {
        const term = this.searchTerm().toLowerCase().trim();
        const opts = this.optionsSignal();
        if (!term) {
            return opts;
        }
        return opts.filter(option => {
            const label = String(option[this.displayField] || '').toLowerCase();
            const id = String(option[this.valueField] || '').toLowerCase();
            return label.includes(term) || id.includes(term);
        });
    });

    readonly selectedOption = computed(() => {
        const value = this.internalValue();
        if (!value) return null;
        return this.optionsSignal().find(o => String(o[this.valueField]) === value) || null;
    });

    @HostListener('document:click', ['$event'])
    onClickOutside(event: Event) {
        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.close();
        }
    }

    writeValue(value: string | null): void {
        this.internalValue.set(value);
        const opts = this.optionsSignal();
        const option = opts.find(o => String(o[this.valueField]) === value);
        if (option) {
            this.searchTerm.set(String(option[this.displayField]));
        } else if (value && this.allowCustom) {
            this.searchTerm.set(value);
        } else if (!value) {
            this.searchTerm.set('');
        }
    }

    registerOnChange(fn: (value: string | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onInputChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchTerm.set(input.value);
        this.isOpen.set(true);
        this.highlightedIndex.set(-1);

        // Si se permite valor personalizado, emitir el valor
        if (this.allowCustom) {
            this.internalValue.set(input.value || null);
            this.onChange(this.internalValue());
        }
    }

    onFocus(): void {
        this.isOpen.set(true);
    }

    onBlur(): void {
        this.onTouched();
        // Delay para permitir que el mousedown se procese
        setTimeout(() => {
            // Si estamos seleccionando, no limpiar
            if (this.isSelecting) {
                this.isSelecting = false;
                return;
            }
            // Solo limpiar si no hay valor seleccionado y no permite valores custom
            if (!this.allowCustom && !this.selectedOption()) {
                this.searchTerm.set('');
                this.internalValue.set(null);
                this.onChange(null);
            }
            this.close();
        }, 200);
    }

    onMouseDown(): void {
        // Marcar que estamos en proceso de selección para evitar que onBlur limpie
        this.isSelecting = true;
    }

    selectOption(option: AutocompleteOption): void {
        this.isSelecting = true;
        const value = String(option[this.valueField]);
        this.internalValue.set(value);
        this.searchTerm.set(String(option[this.displayField]));
        this.onChange(value);
        this.optionSelected.emit(option);
        this.close();
        // Resetear después de un momento
        setTimeout(() => this.isSelecting = false, 50);
    }

    clear(event: Event): void {
        event.stopPropagation();
        event.preventDefault();
        this.internalValue.set(null);
        this.searchTerm.set('');
        this.onChange(null);
        this.optionSelected.emit(null);
    }

    onKeyDown(event: KeyboardEvent): void {
        const options = this.filteredOptions();
        const currentIndex = this.highlightedIndex();

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.isOpen.set(true);
                this.highlightedIndex.set(Math.min(currentIndex + 1, options.length - 1));
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.highlightedIndex.set(Math.max(currentIndex - 1, 0));
                break;
            case 'Enter':
                event.preventDefault();
                if (currentIndex >= 0 && options[currentIndex]) {
                    this.selectOption(options[currentIndex]);
                }
                break;
            case 'Escape':
                this.close();
                break;
        }
    }

    private close(): void {
        this.isOpen.set(false);
        this.highlightedIndex.set(-1);
    }
}


