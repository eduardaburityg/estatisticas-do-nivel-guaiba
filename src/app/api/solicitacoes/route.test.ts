import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { orderMock, singleMock, fromMock } = vi.hoisted(() => {
  const orderMock = vi.fn();
  const selectMock = vi.fn(() => ({ order: orderMock }));
  const singleMock = vi.fn();
  const insertSelectMock = vi.fn(() => ({ single: singleMock }));
  const insertMock = vi.fn(() => ({ select: insertSelectMock }));
  const fromMock = vi.fn(() => ({ select: selectMock, insert: insertMock }));
  return { orderMock, singleMock, fromMock };
});

vi.mock('@/lib/supabase', () => ({
  supabase: { from: fromMock },
}));

import { GET, POST } from './route';

beforeEach(() => {
  orderMock.mockReset();
  singleMock.mockReset();
});

describe('GET /api/solicitacoes', () => {
  it('retorna array vazio quando não há solicitações', async () => {
    orderMock.mockResolvedValue({ data: [], error: null });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual([]);
  });
});

describe('POST /api/solicitacoes', () => {
  function makeRequest(body: Record<string, unknown>) {
    return new NextRequest('http://localhost/api/solicitacoes', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  it('rejeita quando "nome" está ausente', async () => {
    const res = await POST(makeRequest({ cidade: 'Porto Alegre', tipo_ajuda: 'Alimento' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('obrigatórios');
  });

  it('rejeita quando "cidade" está ausente', async () => {
    const res = await POST(makeRequest({ nome: 'João', tipo_ajuda: 'Alimento' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('obrigatórios');
  });

  it('rejeita quando "tipo_ajuda" está ausente', async () => {
    const res = await POST(makeRequest({ nome: 'João', cidade: 'Porto Alegre' }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain('obrigatórios');
  });

  it('cria uma solicitação com sucesso quando nome, cidade e tipo_ajuda estão presentes', async () => {
    singleMock.mockResolvedValue({
      data: { id: 1, nome: 'João', cidade: 'Porto Alegre', tipo_ajuda: 'Alimento' },
      error: null,
    });

    const res = await POST(makeRequest({ nome: 'João', cidade: 'Porto Alegre', tipo_ajuda: 'Alimento' }));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.nome).toBe('João');
    expect(body.id).toBe(1);
  });
});
