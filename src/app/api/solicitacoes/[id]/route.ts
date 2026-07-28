import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const { data, error } = await supabase
    .from('solicitacoes_ajuda')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`[solicitacoes] PUT id=${id} - erro`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[solicitacoes] PUT id=${id} - atualizado`);
  return NextResponse.json(data);
}