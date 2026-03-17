import { useState, useEffect } from 'react';
import { Database, Play, AlertCircle } from 'lucide-react';

export const DatabaseManager = () => {
    const [tables, setTables] = useState<any[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [tableData, setTableData] = useState<any[]>([]);
    const [query, setQuery] = useState<string>('');
    const [queryResult, setQueryResult] = useState<any>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetch('/api/admin/db/tables')
            .then(res => res.json())
            .then(setTables)
            .catch(err => setError(err.message));
    }, []);

    const fetchTableData = (tableName: string) => {
        setSelectedTable(tableName);
        setQueryResult(null);
        fetch(`/api/admin/db/table/${tableName}`)
            .then(res => res.json())
            .then(setTableData)
            .catch(err => setError(err.message));
    };

    const runQuery = async () => {
        setError('');
        try {
            const res = await fetch('/api/admin/db/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const data = await res.json();
            if (res.ok) {
                setQueryResult(data);
                setSelectedTable('');
            } else {
                setError(data.error);
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-4">
                {tables.map(t => (
                    <button
                        key={t.name}
                        onClick={() => fetchTableData(t.name)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all border ${selectedTable === t.name
                            ? 'bg-primary text-white border-primary shadow-lg shadow-orange-200'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'
                            }`}
                    >
                        {t.name}
                    </button>
                ))}
            </div>

            <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <Database className="text-primary w-6 h-6" />
                    <h4 className="text-white font-display font-bold text-xl">SQL Console</h4>
                </div>
                <textarea
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="SELECT * FROM users WHERE role = 'admin'..."
                    className="w-full bg-slate-800 text-emerald-400 font-mono p-4 rounded-lg border border-slate-700 focus:border-primary outline-none min-h-[120px] text-sm"
                />
                <div className="flex justify-between items-center mt-4">
                    <p className="text-slate-500 text-xs font-medium">Use standard SQLite syntax. Be careful with DELETE/DROP.</p>
                    <button
                        onClick={runQuery}
                        className="btn-primary !py-2 !px-8 flex items-center gap-2"
                    >
                        Execute <Play className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            {(selectedTable || queryResult) && (
                <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                        <h4 className="text-xl font-display font-bold text-primary">
                            {selectedTable ? `Table: ${selectedTable}` : 'Query Result'}
                        </h4>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            {(selectedTable ? tableData : (Array.isArray(queryResult) ? queryResult : [queryResult])).length} Rows
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                                    {Object.keys((selectedTable ? tableData[0] : (Array.isArray(queryResult) ? queryResult[0] : queryResult)) || {}).map(key => (
                                        <th key={key} className="px-8 py-4">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(selectedTable ? tableData : (Array.isArray(queryResult) ? queryResult : [queryResult])).map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        {Object.values(row || {}).map((val: any, j) => (
                                            <td key={j} className="px-8 py-4 text-slate-600 font-medium">
                                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
