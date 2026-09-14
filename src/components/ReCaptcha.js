import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  Platform,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';

const RECAPTCHA_SITE_KEY = process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY || '';
const DOMAIN = process.env.EXPO_PUBLIC_RECAPTCHA_DOMAIN || 'http://localhost';

const ReCaptcha = forwardRef(({ onVerify, onError }, ref) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const webContainerRef = useRef(null);
  const webViewRef = useRef(null);
  const webWidgetIdRef = useRef(null);
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
  }, [onError, onVerify]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setVerified(false);
      onVerifyRef.current(null);
      if (Platform.OS === 'web' && window.grecaptcha && webWidgetIdRef.current !== null) {
        window.grecaptcha.reset(webWidgetIdRef.current);
      } else {
        webViewRef.current?.injectJavaScript('window.grecaptcha && grecaptcha.reset(); true;');
      }
    },
  }), []);

  useEffect(() => {
    if (Platform.OS !== 'web' || !webContainerRef.current || !RECAPTCHA_SITE_KEY) {
      return undefined;
    }

    const container = webContainerRef.current;
    const captchaElement = document.createElement('div');
    captchaElement.style.width = '304px';
    captchaElement.style.height = '78px';
    container.appendChild(captchaElement);

    const renderCaptcha = () => {
      if (!window.grecaptcha || !captchaElement.isConnected) return;

      webWidgetIdRef.current = window.grecaptcha.render(captchaElement, {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: (token) => {
          setVerified(true);
          onVerifyRef.current(token);
        },
        'expired-callback': () => {
          setVerified(false);
          onVerifyRef.current(null);
        },
        'error-callback': () => {
          setVerified(false);
          onVerifyRef.current(null);
          onErrorRef.current?.();
        },
      });
    };

    if (window.grecaptcha) {
      window.grecaptcha.ready(renderCaptcha);
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => window.grecaptcha?.ready(renderCaptcha);
      document.head.appendChild(script);
    }

    return () => {
      captchaElement.remove();
    };
  }, []);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, styles.webContainer]} ref={webContainerRef}>
        {!RECAPTCHA_SITE_KEY && (
          <Text style={styles.configurationText}>
            Configura EXPO_PUBLIC_RECAPTCHA_SITE_KEY para activar reCAPTCHA.
          </Text>
        )}
      </View>
    );
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://www.google.com/recaptcha/api.js" async defer></script>
        <style>
          body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            padding: 0;
            background-color: transparent;
          }
        </style>
      </head>
      <body>
        <div class="g-recaptcha"
             data-sitekey="${RECAPTCHA_SITE_KEY}"
             data-callback="onSuccess"
             data-expired-callback="onExpired"
             data-error-callback="onError">
        </div>

        <script>
          function onSuccess(token) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SUCCESS', token }));
          }
          function onExpired() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXPIRED' }));
          }
          function onError() {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ERROR' }));
          }
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SUCCESS') {
        setVerified(true);
        setModalVisible(false);
        onVerify(data.token);
      } else if (data.type === 'EXPIRED' || data.type === 'ERROR') {
        setVerified(false);
        onVerify(null);
        if (onError) onError();
      }
    } catch (err) {
      console.error('Error procesando respuesta del captcha:', err);
    }
  };

  return (
    <View style={styles.container}>
      {!RECAPTCHA_SITE_KEY ? (
        <Text style={styles.configurationText}>
          Configura EXPO_PUBLIC_RECAPTCHA_SITE_KEY para activar reCAPTCHA.
        </Text>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.checkboxButton, verified && styles.checkboxButtonVerified]}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.box, verified && styles.boxChecked]}>
              {verified && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              {verified ? 'Verificación completada' : 'No soy un robot'}
            </Text>
          </TouchableOpacity>

          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {loading && (
                  <ActivityIndicator
                    size="large"
                    color="#2196F3"
                    style={styles.loader}
                  />
                )}
                <WebView
                  ref={webViewRef}
                  originWhitelist={['*']}
                  source={{ html: htmlContent, baseUrl: DOMAIN }}
                  onMessage={handleMessage}
                  onLoadEnd={() => setLoading(false)}
                  style={styles.webview}
                  scrollEnabled={false}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
    alignItems: 'center',
  },
  configurationText: {
    color: '#b91c1c',
    fontSize: 12,
    textAlign: 'center',
  },
  webContainer: {
    width: 334,
    alignSelf: 'center',
  },
  checkboxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    width: '100%',
  },
  checkboxButtonVerified: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  box: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#9e9e9e',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#ffffff',
  },
  boxChecked: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  checkboxText: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 340,
    height: 520,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loader: {
    position: 'absolute',
    top: '45%',
  },
  webview: {
    width: 320,
    height: 440,
    backgroundColor: 'transparent',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ReCaptcha;