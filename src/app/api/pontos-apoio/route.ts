import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('pontos_apoio')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[pontos-apoio] GET - erro', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[pontos-apoio] GET - ${data.length} registros retornados`);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { nome, endereco, tipo, telefone } = await req.json();

  if (!nome || !endereco || !tipo) {
    console.warn('[pontos-apoio] POST - validação falhou');
    return NextResponse.json({ error: 'nome, endereco e tipo são obrigatórios' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('pontos_apoio')
    .insert({ nome, endereco, tipo, telefone })
    .select()
    .single();

  if (error) {
    console.error('[pontos-apoio] POST - erro', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[pontos-apoio] POST - criado id=${data.id}`);
  return NextResponse.json(data, { status: 201 });
}