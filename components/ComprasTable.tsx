'use client';
import React from 'react';
import axios from 'axios';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/24/solid';
import { ref, remove } from 'firebase/database';
import { db } from '../firebaseClient';

export type Compra = {
  id?: string;
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

type Props = { compras: Compra[]; uid: string };

export default function ComprasTable({ compras, uid }: Props) {
  const handleDelete = async (compraId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta compra permanentemente?')) return;
    
    try {
      const compraRef = ref(db, `usuarios/${uid}/compras/${compraId}`);
      await remove(compraRef);
      alert('Compra excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir compra:', error);
      alert('Erro ao excluir a compra. Tente novamente.');
    }
  };

  const handleSave = async () => {
    await axios.post('http://localhost:3000/salvar', { uid, compras });
    alert('Alterações salvas com sucesso!');
  };

  const formatDate = (dateString: string) => {
    try {
      // Tenta converter para o formato brasileiro
      const [year, month, day] = dateString.split('-'); // Para datas no formato ISO
      if (day && month && year) {
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }
      
      // Se já estiver no formato DD/MM/YYYY
      const [d, m, y] = dateString.split('/');
      if (d && m && y) {
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
      }
      
      return 'Data inválida';
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Histórico de Compras
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {['Data', 'Estabelecimento', 'Local', 'Categoria', 'Parcela', 'Valor', 'Observações', 'Ações'].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {compras.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                  {formatDate(c.dataCompra)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-medium">
                  {c.estabelecimento}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {c.local}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 capitalize">
                  {c.categoria}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {c.parcela}x
                </td>
                <td className="px-4 py-3 text-sm font-medium text-green-600 dark:text-green-400">
                  R$ {c.valorOriginal}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                  {c.observacoes || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  <button
                    onClick={() => c.id && handleDelete(c.id)}
                    className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    title="Excluir compra"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t dark:border-gray-700">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all transform hover:scale-[1.02]"
        >
          <CheckCircleIcon className="w-5 h-5" />
          <span className="font-medium">Salvar Todas as Alterações</span>
        </button>
      </div>
    </div>
  );
}