"use client";

import { useEffect, useState } from 'react';

export default function SDKTest() {
  const [result, setResult] = useState<string>('Testing...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testSDK = async () => {
      try {
        addLog('🔄 Starting SDK import test...');
        
        // Create CommonJS polyfill first
        if (typeof window !== 'undefined') {
          if (!(window as any).exports) {
            (window as any).exports = {};
            addLog('✅ Created window.exports polyfill');
          }
          if (!(window as any).module) {
            (window as any).module = { exports: (window as any).exports };
            addLog('✅ Created window.module polyfill');
          }
        }
        
        // Test 1: Try main SDK import
        addLog('🔄 Test 1: Attempting main SDK import...');
        try {
          const sdk = await import('@gems.fun/sdk');
          addLog('✅ Main SDK import successful!');
          const exportKeys = Object.keys(sdk);
          addLog(`📦 Main exports (${exportKeys.length}): ${exportKeys.join(', ')}`);
          
          if (sdk.PumpClient) {
            addLog('✅ PumpClient found in main exports');
            setResult('✅ SDK loaded successfully from main import!');
            return;
          } else {
            addLog('❌ PumpClient not found in main exports');
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          addLog(`❌ Main SDK import failed: ${errorMsg}`);
        }
        
        // Test 2: Try direct client import
        addLog('🔄 Test 2: Attempting direct client import...');
        try {
          const clientModule = await import('@gems.fun/sdk/dist/clients/gemsfun');
          addLog('✅ Direct client import successful!');
          const clientKeys = Object.keys(clientModule);
          addLog(`📦 Client exports (${clientKeys.length}): ${clientKeys.join(', ')}`);
          
          if (clientModule.PumpClient) {
            addLog('✅ PumpClient found in client exports');
            setResult('✅ SDK loaded successfully from client import!');
            return;
          } else {
            addLog('❌ PumpClient not found in client exports');
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          addLog(`❌ Direct client import failed: ${errorMsg}`);
        }
        
        // Test 3: Try clients index import
        addLog('🔄 Test 3: Attempting clients/index import...');
        try {
          const indexModule = await import('@gems.fun/sdk/dist/clients');
          addLog('✅ Clients index import successful!');
          const indexKeys = Object.keys(indexModule);
          addLog(`� Clients index exports (${indexKeys.length}): ${indexKeys.join(', ')}`);
          
          if (indexModule.PumpClient) {
            addLog('✅ PumpClient found in clients index');
            setResult('✅ SDK loaded successfully from clients index!');
            return;
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          addLog(`❌ Clients index import failed: ${errorMsg}`);
        }
        
        setResult('❌ All import attempts failed');
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        addLog(`❌ Test setup failed: ${errorMsg}`);
        setResult(`❌ Failed: ${errorMsg}`);
      }
    };

    testSDK();
  }, []);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-4">
      <h3 className="text-lg font-semibold mb-3">SDK Import Test</h3>
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
