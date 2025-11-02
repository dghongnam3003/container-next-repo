"use client";

import { useEffect, useState } from 'react';

export default function ExportsTest() {
  const [result, setResult] = useState<string>('Testing...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testExports = async () => {
      try {
        addLog('🔄 Starting exports capture test...');
        
        // Setup comprehensive polyfills
        if (typeof window !== 'undefined') {
          const setupExports = () => {
            const globalObj = globalThis as unknown as { 
              exports?: Record<string, unknown>; 
              module?: { exports: Record<string, unknown> } 
            };
            
            globalObj.exports = {};
            globalObj.module = { exports: globalObj.exports };
            
            // Also on window
            const windowObj = window as unknown as { 
              exports?: Record<string, unknown>; 
              module?: { exports: Record<string, unknown> } 
            };
            windowObj.exports = globalObj.exports;
            windowObj.module = globalObj.module;
            
            addLog('✅ Setup polyfills');
            return globalObj;
          };
          
          const globalObj = setupExports();
          
          // Test 1: Import main SDK and check exports object
          addLog('🔄 Test 1: Import main SDK and monitor exports...');
          try {
            await import('@gems.fun/sdk');
            addLog(`📦 After main import - exports keys: [${Object.keys(globalObj.exports).join(', ')}]`);
            addLog(`📦 After main import - module.exports keys: [${Object.keys(globalObj.module.exports).join(', ')}]`);
            
            if (globalObj.exports.PumpClient) {
              addLog('✅ PumpClient found in exports!');
              setResult('✅ Found PumpClient in main SDK exports');
              return;
            }
          } catch (error) {
            addLog(`❌ Main SDK import failed: ${error}`);
          }
          
          // Reset and try client import
          globalObj.exports = {};
          globalObj.module.exports = globalObj.exports;
          
          addLog('🔄 Test 2: Import client and monitor exports...');
          try {
            await import('@gems.fun/sdk/dist/clients/gemsfun');
            addLog(`📦 After client import - exports keys: [${Object.keys(globalObj.exports).join(', ')}]`);
            addLog(`📦 After client import - module.exports keys: [${Object.keys(globalObj.module.exports).join(', ')}]`);
            
            if (globalObj.exports.PumpClient) {
              addLog('✅ PumpClient found in client exports!');
              setResult('✅ Found PumpClient in client exports');
              return;
            }
          } catch (error) {
            addLog(`❌ Client import failed: ${error}`);
          }
          
          setResult('❌ PumpClient not found in any exports');
        }
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        addLog(`❌ Test failed: ${errorMsg}`);
        setResult(`❌ Failed: ${errorMsg}`);
      }
    };

    testExports();
  }, []);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4">
      <h3 className="text-lg font-semibold mb-3 text-blue-800">Exports Capture Test</h3>
      <div className="mb-4 p-3 bg-white rounded border">
        <strong>Result:</strong> {result}
      </div>
      <div className="bg-black text-green-400 p-3 rounded text-sm font-mono max-h-60 overflow-y-auto">
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}
