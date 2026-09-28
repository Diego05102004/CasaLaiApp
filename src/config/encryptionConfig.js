/**
 * Configuración de claves RSA para encriptación híbrida RSA+AES-256-CBC
 * Estas claves se usan tanto en el cliente (React Native) como en el servidor (PHP)
 */

export const ENCRYPTION_CONFIG = {
  // Clave pública RSA (usada para encriptar en el cliente)
  RSA_PUBLIC_KEY: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzQgbNTHIAXC3Z6l8hJ+o
NtgMUjjxptku1XKNAEV7bldmhgYP88SbKpfKPKHMcrFQJ3iZkilKP2sUvBoMIred
aXxxFybDQS+Q+3rktSbWDD2WRz/52ACwi4rJVKTkG70Bl2t7Wnxw4csqOzy0TV63
40QyNCT9yL/6gAnh1RSewPGSFvTHoANWPM8bh7FA6jfBUdm1dVUeqXQMUoueBWka
bcJtTgPk8fjjgHqtCDIpKbPrCd67Rubc3pHJSS/IpNrFUSrbSWAzLKaPD831RojS
29k2B/B86Pcntni7L1mI18iwHJA4tmzp4BksRRr7YRW/v6NzPMjhgTuGRwfCpJGP
jwIDAQAB
-----END PUBLIC KEY-----`,

  // Clave privada RSA (usada para desencriptar en el servidor)
  // NOTA: En producción, esta clave NO debería estar en el cliente
  // Se incluye aquí solo para propósitos de desarrollo y pruebas
  RSA_PRIVATE_KEY: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDNCBs1McgBcLdn
qXyEn6g22AxSOPGm2S7Vco0ARXtuV2aGBg/zxJsql8o8ocxysVAneJmSKUo/axS8
Ggwit51pfHEXJsNBL5D7euS1JtYMPZZHP/nYALCLislUpOQbvQGXa3tafHDhyyo7
PLRNXrfjRDI0JP3Iv/qACeHVFJ7A8ZIW9MegA1Y8zxuHsUDqN8FR2bV1VR6pdAxS
i54FaRptwm1OA+Tx+OOAeq0IMikps+sJ3rtG5tzekclJL8ik2sVRKttJYDMspo8P
zfVGiNLb2TYH8Hzo9ye2eLsvWYjXyLAckDi2bOngGSxFGvthFb+/o3M8yOGBO4ZH
B8KkkY+PAgMBAAECggEAHDx1DsbbzgL5Zx/Kw7L/Jgpr6/jmor0/O2sKqxJmlMQZ
nPSBxub5HY0I73+y2cq8iKsNrzjbfk9fbCZELJXP6mKWaoNOmZAU7eU3URFXohjr
NMXFQS+bIKSM5IjO11kYuoM1WjlQDHB/0OejxxH3zicqqM69WqPBuldiEAfGcziy
ahyWd2Z5LJi+dVHuUZSQOfEJg8pDtH9mT81LwahaLQnrL0eyQqph5+dYxFb/PnE5
asovJOnUKSS9LZfa9VaS/YHyBFtiriLAJIvQAAjhhqp0ATEBchS7ujbfncPuJkvz
hzhp1eMbYxXnoq8q8v5BYCNNyxGgtaBdWSfJTJ054QKBgQDtn9mkBXW3YsAbQACG
f/MLSsz5b3+fOjSXDkp+LA/3FXz48L+6IaGaq3QWveSiPn31aWAqxBuIn1qY2lR4
2tItnfBDVDBjBPoA9KNNycbcUzSArnHGlP09hczDB+N4yZiKfsUParPg3Fvz1Btg
Gi2Ucrf2q+2HDpuFvqCkh4wEYQKBgQDc4wgBWrxZJSQAzY7JYHjSQ4r4VGii96Iy
5zP2Od46H89XFkKbJ1f91/RJkwVWi6rSz0OODf3izjro8jW034+cR1HPEyRaW7z/
lRdEHjzc5CzEG+buoNZ6tONXQUVrtR87lFmaqJMBYRO5gnZOcsQi5L9pJ3yNe1EF
5J/yQ+wZ7wKBgQDWD3AiQADhaQYiBi/y+gRaIdIwye6v4+FISsl0jAD91s+z+jzd
UjqgeN+lNP9n4N/bWkgVfoBHPTaCB/ycupMoIOU14fuM2AjXH4qVIrYP+KyNV5iL
CeBvsb7Z2ptiTkkqSjT/RGIyqI/1QRhAJJT267kpb4wUZGZZv3Y7gRfzQQKBgQDc
VKo7j6Ko2V9cXa68OLrMIguRQcFOLe1hETbHuVluaSSNHes6kLg4wR0v9rMwbQjs
V0pvfI1vm38vtcrUrNu3a3yzLcjpSPDxkGowzGixffkZdSuZhF3s8FqFQtpYYcbR
y1zF5LkeexMNzJDuF5SFqd80qOqYxhU/55mUMyRjiQKBgAEf1OyM/V5JBdodhRqA
fJdj9Mz+YlWdYm3j+aWd82WAuUFZHRpYBde65RkyjJZErMGoSYIFJD7YcWoV8Erq
l16p53xuWk9o16yGnCci+Y5wryrFjf5u5zHFLj9nAekJB2WShOhZIsCM2lYLzCg7
GGzLlE6bk7oHX2ZPGVsFqMpl
-----END PRIVATE KEY-----`,

  // Configuración AES
  AES_METHOD: 'AES-256-CBC',
  AES_KEY_LENGTH: 32, // 256 bits
  IV_LENGTH: 16, // 128 bits
};

export default ENCRYPTION_CONFIG;