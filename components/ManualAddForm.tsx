'use client';
import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '../firebaseClient';
import { DocumentPlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export type Compra = {
  categoria: string;
  dataCompra: string;
  estabelecimento: string;
  local: string;
  observacoes: string;
  parcela: string;
  valorNumerico: number;
  valorOriginal: string;
  timestamp: number;
};

type Props = {
  uid: string;
  onAdd: (c: Compra) => void;
};

export default function ManualAddForm({ uid, onAdd }: Props) {
  const [compra, setCompra] = useState<Compra>({
    categoria: 'outras',
    dataCompra: new Date().toISOString().split('T')[0],
    estabelecimento: '',
    local: '',
    observacoes: '',
    parcela: '1',
    valorNumerico: 0,
    valorOriginal: '',
    timestamp: Date.now()
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    setIsSubmitting(true);
    try {
      const novaCompraRef = ref(db, `usuarios/${uid}/compras`);
      const novaCompra = {
        ...compra,
        timestamp: Date.now()
      };
      await push(novaCompraRef, novaCompra);
      setCompra({
        categoria: 'outras',
        dataCompra: new Date().toISOString().split('T')[0],
        estabelecimento: '',
        local: '',
        observacoes: '',
        parcela: '1',
        valorNumerico: 0,
        valorOriginal: '',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Erro ao adicionar:', error);
      alert('Erro ao salvar compra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (key: keyof Compra, value: string | number) => {
    if (key === 'valorNumerico') {
      const numericValue = Number(value);
      setCompra(prev => ({
        ...prev,
        valorNumerico: numericValue,
        valorOriginal: numericValue.toLocaleString('pt-BR', { 
          style: 'currency', 
          currency: 'BRL' 
        }).replace('R$', '').trim()
      }));
    } else {
      setCompra(prev => ({ ...prev, [key]: value }));
    }
  };

  const isValid = compra.estabelecimento && compra.valorNumerico > 0 && compra.dataCompra;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <DocumentPlusIcon className="w-6 h-6 text-green-500" />
          Adicionar Compra Manual
        </h2>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estabelecimento *
            </label>
            <input
              placeholder="Ex: Mercado Central"
              value={compra.estabelecimento}
              onChange={e => handleChange('estabelecimento', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria
            </label>
            <select
              value={compra.categoria}
              onChange={e => handleChange('categoria', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {['Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'outras'].map(categoria => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Local
            </label>
            <input
              placeholder="Ex: São Paulo, SP"
              value={compra.local}
              onChange={e => handleChange('local', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Parcelas
            </label>
            <select
              value={compra.parcela}
              onChange={e => handleChange('parcela', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                <option key={n} value={n.toString()}>
                  {n}x
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor *
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="Ex: 150.00"
              value={compra.valorNumerico || ''}
              onChange={e => handleChange('valorNumerico', parseFloat(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data *
            </label>
            <input
              type="date"
              value={compra.dataCompra}
              onChange={e => handleChange('dataCompra', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Observações
          </label>
          <textarea
            placeholder="Detalhes adicionais"
            value={compra.observacoes}
            onChange={e => handleChange('observacoes', e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows={3}
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={!isValid || isSubmitting}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-all ${
            isValid && !isSubmitting
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-sm hover:shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-5 h-5" />
              Adicionar Compra
            </>
          )}
        </button>
      </div>
    </div>
  );
}