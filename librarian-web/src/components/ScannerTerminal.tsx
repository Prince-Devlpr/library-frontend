import React, { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../api';
import { Scan, QrCode, Camera, CameraOff, Upload, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const ScannerTerminal: React.FC = () => {
  const [scanInput, setScanInput] = useState('');
  const [resolvedEntity, setResolvedEntity] = useState<{ entityType: string; data: any } | null>(null);
  const [scanHistory, setScanHistory] = useState<Array<{ time: string; input: string; entityType: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasBarcodeDetector, setHasBarcodeDetector] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    if ('BarcodeDetector' in window) {
      setHasBarcodeDetector(true);
    }
  }, []);

  const processScan = useCallback(async (token: string) => {
    if (!token.trim()) return;
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.resolveScan(token.trim());
      setResolvedEntity(res);
      setSuccessMsg(`Successfully identified ${res.entityType}!`);
      setScanHistory((prev) => [
        { time: new Date().toLocaleTimeString(), input: token.trim(), entityType: res.entityType },
        ...prev.slice(0, 9),
      ]);
      setScanInput('');

      // Optional sound beep on scan success
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 880; // A5 tone
        gain.gain.value = 0.1;
        osc.start();
        setTimeout(() => {
          osc.stop();
          audioCtx.close();
        }, 120);
      } catch {}
    } catch (err: any) {
      setError(err.message || 'Scanned code not recognized');
    }
  }, []);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processScan(scanInput);
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);

      // Start continuous scanner loop
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'ean_13', 'upc_a', 'code_39'],
        });

        const interval = window.setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const rawVal = barcodes[0].rawValue;
                if (rawVal) {
                  processScan(rawVal);
                }
              }
            } catch {}
          }
        }, 250);

        scanIntervalRef.current = interval;
      }
    } catch (err: any) {
      setCameraError(err.message || 'Could not access web camera');
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Handle Image File Upload Scan
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if ('BarcodeDetector' in window) {
      try {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = async () => {
          const detector = new (window as any).BarcodeDetector({
            formats: ['qr_code', 'code_128', 'ean_13', 'upc_a'],
          });
          const barcodes = await detector.detect(img);
          if (barcodes.length > 0) {
            processScan(barcodes[0].rawValue);
          } else {
            setError('No readable QR code or barcode found in this image.');
          }
        };
      } catch {
        setError('Failed to analyze image file.');
      }
    } else {
      setError('Native BarcodeDetector not available in this browser for file upload analysis.');
    }
  };

  const triggerTestScan = (code: string) => {
    setScanInput(code);
    processScan(code);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      {/* Scanner Input Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Scan size={22} color="var(--accent-secondary)" />
          Universal Hardware & Camera Scanner Terminal
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px' }}>
          Connect physical USB/Bluetooth laser guns, use your laptop/webcam camera in real-time, or upload image files.
        </p>

        {/* Camera Feed Toggle & Window */}
        <div style={{ marginBottom: '20px', borderRadius: '12px', border: '1px solid var(--border-subtle)', padding: '16px', background: '#f8fafc' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Camera size={16} color="var(--accent-primary)" />
              Webcam Video Scanner
              {hasBarcodeDetector && (
                <span className="badge badge-available" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                  Hardware Accelerated
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {isCameraActive && (
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
                    setFacingMode(nextMode);
                    stopCamera();
                    setTimeout(() => startCamera(), 100);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                >
                  <RefreshCw size={12} /> Flip Camera
                </button>
              )}
              <button
                id="btn-toggle-camera"
                type="button"
                onClick={isCameraActive ? stopCamera : startCamera}
                className={isCameraActive ? 'btn btn-secondary' : 'btn btn-primary'}
                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              >
                {isCameraActive ? (
                  <>
                    <CameraOff size={14} /> Stop Camera
                  </>
                ) : (
                  <>
                    <Camera size={14} /> Start Live Camera
                  </>
                )}
              </button>
            </div>
          </div>

          {isCameraActive && (
            <div style={{ position: 'relative', width: '100%', height: '240px', background: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <video
                ref={videoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                playsInline
                muted
              />
              {/* Animated Target Reticle */}
              <div
                style={{
                  position: 'absolute',
                  width: '160px',
                  height: '160px',
                  border: '2px solid #38bdf8',
                  borderRadius: '12px',
                  boxShadow: '0 0 15px rgba(56, 189, 248, 0.6)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          )}

          {cameraError && (
            <div style={{ marginTop: '10px', color: '#b91c1c', fontSize: '0.75rem' }}>
              ⚠️ Camera Error: {cameraError}
            </div>
          )}
        </div>

        {/* Hardware Wedge Input Form */}
        <form onSubmit={handleScanSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Live Wedge Scanner Input (Auto-Focused)</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready for USB / Gun</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="scanner-active-input"
                ref={inputRef}
                type="text"
                placeholder="Scan barcode / QR code or paste token..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                className="form-input"
                style={{
                  width: '100%',
                  fontSize: '1.05rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.5px',
                  borderColor: 'var(--accent-secondary)',
                  boxShadow: 'var(--shadow-glow)',
                }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button id="btn-submit-scan" type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Process Scanned Code
            </button>
            <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Upload size={14} /> Scan Image
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </form>

        {/* Simulation Buttons */}
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
            Simulate Standard LMS QR / Barcode Events:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              onClick={() => triggerTestScan('lms:v1:m:mem_98a7c2b6f103e5a4')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            >
              + Member Card QR
            </button>
            <button
              onClick={() => triggerTestScan('lms:v1:r:res_a1b2c3d4e5f6')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            >
              + 24h Reservation QR
            </button>
            <button
              onClick={() => triggerTestScan('BC-100234')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            >
              + Book Barcode (BC-100234)
            </button>
            <button
              onClick={() => triggerTestScan('lms:v1:cash:CASH-7492')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px', color: '#059669', borderColor: '#a7f3d0' }}
            >
              + Cash Voucher QR
            </button>
            <button
              onClick={() => triggerTestScan('RES-7492')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 10px' }}
            >
              + Fallback Code (RES-7492)
            </button>
          </div>
        </div>

        {successMsg && (
          <div style={{ marginTop: '16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', padding: '12px', color: '#059669', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {error && (
          <div style={{ marginTop: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '12px', color: '#b91c1c', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}
      </div>

      {/* Resolved Entity Details */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ marginBottom: '16px' }}>Authoritative Verification</h3>

        {!resolvedEntity ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <QrCode size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
            <p>Scan any barcode or QR code on the left to verify patron, book copy, or reservation details.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <span className="badge badge-available">{resolvedEntity.entityType} DETECTED</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Live Authoritative State</span>
            </div>

            {resolvedEntity.entityType === 'MEMBER' && (
              <div style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>
                <div><strong>Patron Name:</strong> {resolvedEntity.data.name}</div>
                <div><strong>Registration ID:</strong> <code>{resolvedEntity.data.registrationNumber}</code></div>
                <div><strong>Email:</strong> {resolvedEntity.data.email}</div>
                <div><strong>Account Status:</strong> <span className="badge badge-available">{resolvedEntity.data.status}</span></div>
                <div><strong>Active Loans:</strong> {resolvedEntity.data.loans?.length || 0}</div>
              </div>
            )}

            {resolvedEntity.entityType === 'COPY' && (
              <div style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>
                <div><strong>Title:</strong> {resolvedEntity.data.book?.title}</div>
                <div><strong>Barcode:</strong> <code style={{ color: '#0284c7', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>{resolvedEntity.data.barcode}</code></div>
                <div><strong>Status:</strong> <span className="badge badge-borrowed">{resolvedEntity.data.status}</span></div>
                <div><strong>Shelf Location:</strong> {resolvedEntity.data.shelfLocation}</div>
              </div>
            )}

            {resolvedEntity.entityType === 'RESERVATION' && (
              <div style={{ fontSize: '0.875rem', lineHeight: 1.8 }}>
                <div><strong>Book Title:</strong> {resolvedEntity.data.copy?.book?.title}</div>
                <div><strong>Patron:</strong> {resolvedEntity.data.user?.name} ({resolvedEntity.data.user?.registrationNumber})</div>
                <div><strong>Pickup Code:</strong> <strong style={{ color: '#d97706' }}>{resolvedEntity.data.pickupCode}</strong></div>
                <div><strong>Allocated Barcode:</strong> <code>{resolvedEntity.data.copy?.barcode}</code></div>
                <div><strong>24h Expiry:</strong> {new Date(resolvedEntity.data.expiryDate).toLocaleString()}</div>
              </div>
            )}

            {resolvedEntity.entityType === 'CASH_VOUCHER' && (
              <div style={{ fontSize: '0.875rem', lineHeight: 1.8, background: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontWeight: 700, color: '#166534', marginBottom: '6px' }}>Counter Cash Fine Voucher</div>
                <div><strong>Voucher Code:</strong> <code>{resolvedEntity.data.voucherCode}</code></div>
                <div><strong>Fine Amount:</strong> <strong style={{ color: '#dc2626' }}>₹{Number(resolvedEntity.data.amount || 25).toFixed(2)}</strong></div>
                {resolvedEntity.data.patron && (
                  <div><strong>Patron:</strong> {resolvedEntity.data.patron.name} ({resolvedEntity.data.patron.registrationNumber})</div>
                )}
                {resolvedEntity.data.bookTitle && (
                  <div><strong>Book:</strong> {resolvedEntity.data.bookTitle}</div>
                )}
                <div style={{ marginTop: '8px' }}>
                  <span className="badge badge-paid">READY FOR CASH COLLECTION</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scan History Log */}
        {scanHistory.length > 0 && (
          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              Recent Terminal Scans
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {scanHistory.map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '6px 10px', borderRadius: '4px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{h.input}</span>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{h.entityType} ({h.time})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
