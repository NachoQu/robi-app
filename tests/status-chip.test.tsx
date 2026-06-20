import { render, screen } from '@testing-library/react'
import { StatusChip } from '@/components/ui/status-chip'

test('muestra el label correcto por estado', () => {
  const { rerender } = render(<StatusChip status="nuevo" />)
  expect(screen.getByText('Nuevo')).toBeTruthy()
  rerender(<StatusChip status="en-progreso" />)
  expect(screen.getByText('En progreso')).toBeTruthy()
  rerender(<StatusChip status="completado" />)
  expect(screen.getByText('Completado')).toBeTruthy()
})
