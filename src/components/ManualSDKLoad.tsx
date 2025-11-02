"use client";

import { useEffect, useState } from 'react';

export default function ManualSDKLoad() {
  const [result, setResult] = useState<string>('Testing...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testManualLoad = async () => {
      try {
        addLog('🔄 Starting manual SDK load test...');
        
        // Try to load the SDK file content and evaluate it manually
        try {
          // This is a hack but might work - try to access the raw module content
          addLog('🔄 Attempting manual evaluation...');
          
          // Create a sandboxed environment for CommonJS
          const createCommonJSEnvironment = () => {
            const moduleExports = {} as Record<string, unknown>;
            const moduleObject = { exports: moduleExports };
            
            return {
              exports: moduleExports,
              module: moduleObject,
              require: (id: string) => {
                addLog(`📦 Mock require called for: ${id}`);
                // Return mock objects for required modules
                if (id.includes('web3')) return {};
                if (id.includes('anchor')) return { AnchorProvider: class {}, Program: class {}, Connection: class {} };
                if (id.includes('metaplex')) return {};
                return {};
              },
              __dirname: '/dist/clients',
              __filename: '/dist/clients/gemsfun.js',
              global: globalThis,
              Buffer: (globalThis as any).Buffer || class Buffer {},
              process: { env: {} }
            };
          };
          
          const env = createCommonJSEnvironment();
          
          // Instead of trying to evaluate raw JS, let's try a different approach
          // Let's see if we can trick the module system
          addLog('🔄 Trying module system manipulation...');
          
          // Temporarily override the require function
          const originalRequire = (globalThis as any).require;
          (globalThis as any).require = env.require;
          
          // Set up exports
          (globalThis as any).exports = env.exports;
          (globalThis as any).module = env.module;
          
          try {
            // Now try the import - the CommonJS code should populate our exports object
            await import('@gems.fun/sdk/dist/clients/gemsfun');
            
            addLog(`📦 After manual setup - exports keys: [${Object.keys(env.exports).join(', ')}]`);
            addLog(`📦 After manual setup - module.exports keys: [${Object.keys(env.module.exports).join(', ')}]`);
            
            if (env.exports.PumpClient) {
              addLog('✅ Found PumpClient in manual exports!');
              setResult('✅ Manual evaluation successful!');
              return;
            } else if ((globalThis as any).exports?.PumpClient) {
              addLog('✅ Found PumpClient in global exports!');
              setResult('✅ Found in global exports!');
              return;
            }
            
          } finally {
            // Restore original require
            (globalThis as any).require = originalRequire;
          }
          
          setResult('❌ Manual evaluation failed');
          
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          addLog(`❌ Manual load failed: ${errorMsg}`);
          setResult(`❌ Failed: ${errorMsg}`);
        }
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        addLog(`❌ Test failed: ${errorMsg}`);
        setResult(`❌ Failed: ${errorMsg}`);
      }
    };

    testManualLoad();
  }, []);

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-4">
      <h3 className="text-lg font-semibold mb-3 text-purple-800">Manual SDK Load Test</h3>
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
