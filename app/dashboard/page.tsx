'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ref, onValue } from 'firebase/database';
import { db } from '../../firebaseClient';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import UploadForm from '../../components/UploadForm';
import ManualAddForm from '../../components/ManualAddForm';
import ComprasTable from '../../components/ComprasTable';
import { Pie, Bar } from 'react-chartjs-2';
import {
    ArrowLeftOnRectangleIcon,
    CurrencyDollarIcon,
    ChartBarIcon,
    CalendarIcon,
    DocumentArrowUpIcon,
    DocumentPlusIcon,
    TableCellsIcon
} from '@heroicons/react/24/outline';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [compras, setCompras] = useState<any[]>([]);
    const [selectedSection, setSelectedSection] = useState('overview');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => {
        if (!user) return;
        const comprasRef = ref(db, `usuarios/${user.uid}/compras`);

        const unsubscribe = onValue(comprasRef, (snapshot) => {
            const data: Record<string, any> = snapshot.val() ?? {};
            const comprasComIds = Object.entries(data).map(([id, compra]) => ({
                id,
                categoria: compra.categoria || 'Outras',
                dataCompra: compra.dataCompra || new Date().toLocaleDateString('pt-BR'), // Valor padrão
                estabelecimento: compra.estabelecimento || '',
                local: compra.local || '',
                observacoes: compra.observacoes || '',
                parcela: compra.parcela || '1',
                valorNumerico: compra.valorNumerico || 0,
                valorOriginal: compra.valorOriginal || '0,00',
                timestamp: compra.timestamp || 0
            }));
            setCompras(comprasComIds);
        });

        return () => unsubscribe();
    }, [user]);

    if (!user) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    // Função para converter data DD/MM/YYYY para Date
    const parseDate = (dateString: string | undefined) => {
        if (!dateString) return new Date(); // Fallback para data atual se não existir

        try {
            // Tenta converter de DD/MM/YYYY
            const [day, month, year] = dateString.split('/');
            if (day && month && year) {
                return new Date(`${year}-${month}-${day}`);
            }

            // Tenta converter de ISO string
            return new Date(dateString);
        } catch {
            return new Date(); // Fallback para data atual em caso de erro
        }
    };

    const calcularProjecaoParcelas = () => {
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        // Objeto para armazenar as projeções
        const projecao: Record<string, number> = {};

        compras.forEach(compra => {
            const totalParcelas = parseInt(compra.parcela.replace('x', '')) || 1;
            const valorParcela = compra.valorNumerico / totalParcelas;
            const dataCompra = parseDate(compra.dataCompra);

            const mesInicial = dataCompra.getMonth();
            const anoInicial = dataCompra.getFullYear();

            // Calcular meses restantes
            const mesesDecorridos = ((anoAtual - anoInicial) * 12) + (mesAtual - mesInicial);
            const parcelasRestantes = totalParcelas - mesesDecorridos;

            if (parcelasRestantes > 0) {
                for (let i = 1; i <= parcelasRestantes; i++) {
                    const mesProjecao = mesAtual + i;
                    const dataProjecao = new Date(anoAtual, mesProjecao, 1);
                    const mesNome = dataProjecao.toLocaleString('pt-BR', { month: 'long' });

                    projecao[mesNome] = (projecao[mesNome] || 0) + valorParcela;
                }
            }
        });

        return projecao;
    };
    // Cálculos para métricas
    const totalGasto = compras.reduce((acc, curr) => acc + curr.valorNumerico, 0);

    // Calcular meses com registros
    const mesesCompras = compras
        .map(c => parseDate(c.dataCompra).getMonth())
        .filter((value, index, self) => self.indexOf(value) === index);
    const mesesCount = mesesCompras.length || 1;
    const mediaMensal = totalGasto / mesesCount;

    const gastosPorCategoria = compras.reduce((acc, curr) => {
        const categoria = curr.categoria;
        acc[categoria] = (acc[categoria] || 0) + curr.valorNumerico;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(gastosPorCategoria),
        datasets: [{
            label: 'Gastos por Categoria',
            data: Object.values(gastosPorCategoria),
            backgroundColor: [
                '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
                '#EC4899', '#14B8A6', '#F97316', '#64748B', '#06B6D4'
            ],
            borderWidth: 0,
        }]
    };

    const barData = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        datasets: [{
            label: 'Gastos Mensais',
            data: Array(12).fill(0).map((_, i) =>
                compras
                    .filter(c => parseDate(c.dataCompra).getMonth() === i)
                    .reduce((acc, curr) => acc + curr.valorNumerico, 0)
            ),
            backgroundColor: '#3B82F6',
            borderRadius: 8,
        }]
    };


    const renderSection = () => {
        switch (selectedSection) {
            case 'import':
                return <UploadForm uid={user.uid} onImport={setCompras} />;
            case 'manual':
                return <ManualAddForm uid={user.uid} onAdd={c => setCompras(prev => [...prev, c])} />;
            case 'history':
                return <ComprasTable compras={compras} uid={user.uid} />;
            default:
                return (
                    <div className="space-y-8">
                        {/* Gráficos */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 dark:text-white">Distribuição por Categoria</h3>
                                <div className="h-80">
                                    <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                                <h3 className="text-lg font-semibold mb-4 dark:text-white">Gastos Mensais</h3>
                                <div className="h-80">
                                    <Bar data={barData} options={{ maintainAspectRatio: false }} />
                                </div>
                            </div>
                        </div>

                        {/* Cards de Métricas */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <MetricCard
                                icon={CurrencyDollarIcon}
                                title="Total Gasto"
                                value={totalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                change={((totalGasto - mediaMensal) / mediaMensal * 100).toFixed(1) + '%'}
                            />

                            <MetricCard
                                icon={ChartBarIcon}
                                title="Média Mensal"
                                value={mediaMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            />

                            <MetricCard
                                icon={CalendarIcon}
                                title="Último Mês"
                                value={barData.datasets[0].data[new Date().getMonth()]?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                            />
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold mb-4 dark:text-white">Projeção de Parcelas Futuras</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(calcularProjecaoParcelas()).map(([mes, valor]) => (
                                    <div key={mes} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-300 capitalize">
                                            {mes}
                                        </div>
                                        <div className="mt-1 text-xl font-semibold text-green-600 dark:text-green-400">
                                            {valor.toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-50">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-8">
                        <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
                        <h1 className="text-xl font-bold dark:text-white">Finance Control</h1>
                    </div>

                    <nav className="space-y-2">
                        {[
                            { id: 'overview', name: 'Visão Geral', icon: ChartBarIcon },
                            { id: 'import', name: 'Importar Compras', icon: DocumentArrowUpIcon },
                            { id: 'manual', name: 'Adicionar Manual', icon: DocumentPlusIcon },
                            { id: 'history', name: 'Histórico', icon: TableCellsIcon },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setSelectedSection(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${selectedSection === item.id
                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            <main className="ml-64 p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">
                            {selectedSection === 'overview' ? 'Visão Geral' :
                                selectedSection === 'import' ? 'Importar Compras' :
                                    selectedSection === 'manual' ? 'Adicionar Manualmente' : 'Histórico de Compras'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {selectedSection === 'overview' ? 'Análise detalhada dos seus gastos' : 'Gerencie suas transações'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowLogoutConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                            Sair
                        </button>
                    </div>
                </div>

                {/* Conteúdo Principal */}
                {renderSection()}
            </main>

            {/* Modal de Confirmação */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-sm w-full">
                        <h3 className="text-lg font-semibold mb-4 dark:text-white">Confirmar Saída</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Tem certeza que deseja sair da sua conta?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg flex items-center gap-2"
                            >
                                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                                Confirmar Saída
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const MetricCard = ({ icon: Icon, title, value, change }: any) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Icon className="w-6 h-6 text-blue-500" />
            </div>
            <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</dt>
                <dd className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{value}</dd>
                {change && (
                    <span className={`text-sm ${change.includes('-') ? 'text-red-500' : 'text-green-500'}`}>
                        {change} vs mês anterior
                    </span>
                )}
            </div>
        </div>
    </div>
);