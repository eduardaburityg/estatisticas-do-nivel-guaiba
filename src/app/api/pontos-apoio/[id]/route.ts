import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { nome, endereco, tipo, telefone } = await req.json();

  const { data, error } = await supabase
    .from('pontos_apoio')
    .update({ nome, endereco, tipo, telefone })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`[pontos-apoio] PUT id=${id} - erro`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[pontos-apoio] PUT id=${id} - atualizado`);
  return NextResponse.json(data);
}