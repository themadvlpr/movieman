export default function Loader() {
    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#050509',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            overflow: 'hidden'
        }}>
            {/* Background Gradients */}
            <div style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundColor: 'black',
                pointerEvents: 'none'
            }} />

            {/* Spinner Container */}
            <div style={{ position: 'relative' }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '4px solid rgba(255, 255, 255, 0.05)',
                    borderTopColor: 'rgba(255, 255, 255, 0.8)',
                    animation: 'loader-spin 1s linear infinite',
                }} />
                <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    filter: 'blur(16px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    animation: 'loader-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }} />
            </div>

            {/* Text & Shimmer Bar */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
            }}>
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.9)',
                    margin: 0,
                    animation: 'loader-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}>
                    Loading...
                </h2>
                <div style={{
                    width: '192px',
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.4), transparent)',
                        animation: 'loader-shimmer 1.5s infinite',
                        transform: 'translateX(-100%)'
                    }} />
                </div>
            </div>

            {/* Inline Keyframes */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes loader-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes loader-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes loader-shimmer {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
}

