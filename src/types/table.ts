export interface BaseTableColumn<T = Record<string, unknown>> {
  field: keyof T | string
  header: string
  minWidth?: string
  width?: string
  sortable?: boolean
  frozen?: boolean
  align?: 'left' | 'center' | 'right'
  bodyClass?: string
  headerClass?: string
}
