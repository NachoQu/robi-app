import { render } from '@testing-library/react'
import { Button } from '@/components/ui/button'

test('primary variant aplica fondo primario y forma pill', () => {
  const { getByRole } = render(<Button variant="primary">Hola</Button>)
  const cls = getByRole('button').className
  expect(cls.includes('bg-primary')).toBe(true)
  expect(cls.includes('rounded-full')).toBe(true)
})

test('tertiary variant es outline transparente', () => {
  const { getByRole } = render(<Button variant="tertiary">Hola</Button>)
  const cls = getByRole('button').className
  expect(cls.includes('border')).toBe(true)
  expect(cls.includes('bg-transparent')).toBe(true)
})
