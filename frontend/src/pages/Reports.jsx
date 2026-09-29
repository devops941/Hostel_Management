import React, { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp, Users, PieChart, Activity } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Reports({ user, token, setPageError, setNotice }) {
  const [reportType, setReportType] = useState('occupancy');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (reportType === 'occupancy') endpoint = '/rooms';
      else if (reportType === 'fees') endpoint = '/fees';
      else if (reportType === 'complaints') endpoint = '/complaints';

      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (res.ok) {
        const ignored = ['_id', '__v', 'updatedAt', 'password'];
        const cleaned = result.map(item => {
          const flat = {};
          Object.keys(item).forEach(key => {
            if (ignored.includes(key)) return;
            
            let val = item[key];
            if (val === null && key === 'student') {
               flat[key] = 'Deleted User';
            } else if (typeof val === 'object' && val !== null) {
              // Extract name from populated object (e.g. student.name)
              if (val.name) flat[key] = val.name;
              else return; // skip other complex objects
            } else {
              // Format dates nicely
              if (typeof val === 'string' && (key.endsWith('Date') || key === 'createdAt')) {
                 flat[key] = new Date(val).toLocaleDateString();
              } else {
                 flat[key] = val !== null ? val : 'N/A';
              }
            }
          });
          return flat;
        });
        setData(cleaned);
      } else {
        setPageError(result.message || 'Failed to fetch report data');
      }
    } catch (err) {
      setPageError('An error occurred while fetching reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!data || data.length === 0) {
      setPageError('No data to download.');
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Get headers
    const headers = Object.keys(data[0]);
    csvContent += headers.join(",") + "\n";

    // Get rows
    data.forEach(row => {
      const rowData = headers.map(header => {
        let val = row[header];
        if (typeof val === 'string') {
          val = val.replace(/"/g, '""'); // Escape quotes
          return `"${val}"`;
        }
        return val;
      });
      csvContent += rowData.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotice(`Downloaded ${reportType} report successfully.`);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">System Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Generate and download hostel operation reports.</p>
        </div>
        <button 
          onClick={handleDownloadCSV}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="p-6 border-b border-gray-100 bg-gray-50 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setReportType('occupancy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${reportType === 'occupancy' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
        >
          <Users className="w-4 h-4" />
          Occupancy & Rooms
        </button>
        <button
          onClick={() => setReportType('fees')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${reportType === 'fees' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
        >
          <TrendingUp className="w-4 h-4" />
          Fees & Payments
        </button>
        <button
          onClick={() => setReportType('complaints')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${reportType === 'complaints' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
        >
          <Activity className="w-4 h-4" />
          Complaints & Maintenance
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
             {data.length > 0 ? (
               <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                   <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                     <tr>
                       {Object.keys(data[0]).slice(0, 6).map(header => (
                         <th key={header} className="p-4 capitalize">{header.replace(/([A-Z])/g, ' $1').trim()}</th>
                       ))}
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {data.slice(0, 20).map((row, idx) => (
                       <tr key={idx} className="hover:bg-gray-50/50">
                         {Object.keys(data[0]).slice(0, 6).map(header => (
                           <td key={header} className="p-4 text-gray-700 truncate max-w-[200px]">{String(row[header])}</td>
                         ))}
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {data.length > 20 && (
                   <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-100 bg-gray-50">
                     Showing 20 of {data.length} records. Download CSV to view all.
                   </div>
                 )}
               </div>
             ) : (
               <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                  <FileText className="w-12 h-12 text-gray-300 mb-3" />
                  <p>No data available for {reportType}.</p>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
