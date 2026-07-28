import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('solicitacoes_ajuda')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[solicitacoes] GET - erro', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[solicitacoes] GET - ${data.length} registros retornados`);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { nome, cidade, bairro, tipo_ajuda, descricao, telefone } = await req.json();

  if (!nome || !cidade || !tipo_ajuda) {
    console.warn('[solicitacoes] POST - validação falhou');
    return NextResponse.json({ error: 'nome, cidade e tipo_ajuda são obrigatórios' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('solicitacoes_ajuda')
    .insert({ nome, cidade, bairro, tipo_ajuda, descricao, telefone })
    .select()
    .single();

  if (error) {
    console.error('[solicitacoes] POST - erro', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[solicitacoes] POST - criado id=${data.id}`);
  return NextResponse.json(data, { status: 201 });
}