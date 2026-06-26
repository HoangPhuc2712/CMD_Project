export type PrimeSeverity = 'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast'

export type PrimeSize = 'small' | 'large'

export type InlineMessageSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'

export type InlineMessageVariant = 'outlined' | 'simple'

export interface SelectOption<TValue = string | number> {
  label: string
  value: TValue
}
