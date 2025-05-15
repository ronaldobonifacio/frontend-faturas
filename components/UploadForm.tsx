'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { Compra } from './ComprasTable';
import { ArrowUpTrayIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

type Props = {
  uid: string;
  onImport: (c: Compra[]) => void;
};

export default function UploadForm({ uid, onImport }: Props) {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const fd = new FormData();
    fd.append('uid', uid);
    Array.from(files).forEach(f => fd.append('images', f));

    try {
      const res = await axios.post<{ compras: Compra[] }>('http://localhost:3000/import', fd);
      onImport(res.data.compras);
    } catch (error) {
      console.error('Erro ao importar:', error);
      alert('Erro ao importar as imagens');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <DocumentArrowUpIcon className="w-6 h-6 text-blue-500" />
          Importar Compras
        </h2>
      </div>

      <div className="p-6">
        <label className="group relative cursor-pointer">
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition-all">
            <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 group-hover:text-blue-500 dark:text-gray-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Arraste arquivos ou clique para selecionar
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Formatos suportados: PNG, JPG, PDF (máx. 5MB)
              </p>
            </div>
          </div>
          <input
            type="file"
            multiple
            onChange={e => setFiles(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>

        {files && files.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            <span className="font-medium">{files.length}</span> arquivo(s) selecionado(s)
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!files || isUploading}
          className={`mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-all ${files && !isUploading
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm hover:shadow-md'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
        >
          {isUploading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
              Processando...
            </>
          ) : (
            <>
              <ArrowUpTrayIcon className="w-5 h-5" />
              {files ? `Importar ${files.length} Arquivo(s)` : 'Selecione os Arquivos'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}