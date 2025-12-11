import React, { useState } from 'react';
import { FaTimes, FaLock, FaCreditCard, FaMoneyBillWave, FaExchangeAlt } from 'react-icons/fa';

function PaymentModal({ isOpen, costo, onConfirm, onCancel, loading }) {
  const [metodo, setMetodo] = useState('Tarjeta');
  const [cardData, setCardData] = useState({
    numero: '',
    titular: '',
    mes: '',
    ano: '',
    cvv: ''
  });
  const [procesando, setProcesando] = useState(false);
  const [procesado, setProcesado] = useState(false);
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'numero') {
      const soloNumeros = value.replace(/\D/g, '');
      if (soloNumeros.length <= 16) {
        setCardData({ ...cardData, [name]: soloNumeros });
        setFlipped(false);
      }
    } else if (name === 'cvv') {
      const soloNumeros = value.replace(/\D/g, '');
      if (soloNumeros.length <= 3) {
        setCardData({ ...cardData, [name]: soloNumeros });
        setFlipped(soloNumeros.length > 0);
      }
    } else if (name === 'mes') {
      const mes = value.replace(/\D/g, '');
      if (mes === '' || (parseInt(mes) >= 1 && parseInt(mes) <= 12)) {
        setCardData({ ...cardData, [name]: mes });
      }
    } else if (name === 'ano') {
      const soloNumeros = value.replace(/\D/g, '');
      if (soloNumeros.length <= 4) {
        setCardData({ ...cardData, [name]: soloNumeros });
      }
    } else if (name === 'titular') {
      setCardData({ ...cardData, [name]: value.toUpperCase() });
    }
  };

  const handleProcesar = async () => {
    if (metodo === 'Tarjeta') {
      if (!cardData.numero || !cardData.titular || !cardData.mes || !cardData.ano || !cardData.cvv) {
        alert('Por favor completa todos los campos de la tarjeta');
        return;
      }
      if (cardData.numero.length !== 16) {
        alert('El número de tarjeta debe tener 16 dígitos');
        return;
      }
      if (parseInt(cardData.mes) < 1 || parseInt(cardData.mes) > 12) {
        alert('El mes debe estar entre 01 y 12');
        return;
      }
    }

    setProcesando(true);
    
    setTimeout(() => {
      setProcesando(false);
      setProcesado(true);
      
      setTimeout(() => {
        onConfirm(metodo);
      }, 1500);
    }, 1800);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden animate-slideUp">
        {/* Header minimalista */}
        <div className="bg-white px-8 py-5 flex items-center justify-between border-b border-gray-100 animate-fadeInDown">
          <div className="flex items-center gap-2">
            <div className="animate-pulse">
              <FaLock className="text-green-950 text-lg" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Pago Seguro</h2>
          </div>
          <button 
            onClick={onCancel}
            disabled={procesando || procesado}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50 transition hover:scale-110"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-8">
          {!procesado ? (
            <div className={`transition-all duration-300 ${metodo === 'Tarjeta' ? 'grid grid-cols-2 gap-12' : 'max-w-lg mx-auto'}`}>
              {/* IZQUIERDA - Tarjeta visual (solo si es Tarjeta) */}
              {metodo === 'Tarjeta' && (
              <div className="flex items-center justify-center animate-fadeInLeft">
                <div className="w-full max-w-sm" style={{ perspective: '1000px' }}>
                  <div 
                    className={`relative w-full h-64 transition-transform duration-700 cursor-pointer hover:shadow-2xl`}
                    onClick={handleFlip}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                  >
                    {/* FRENTE - Tarjeta */}
                    <div
                      className="absolute w-full h-full rounded-2xl shadow-xl p-6 text-white"
                      style={{
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 50%, #16213e 100%)',
                        backfaceVisibility: 'hidden'
                      }}
                    >
                      {/* Contenido relativo */}
                      <div className="relative h-full flex flex-col justify-between">
                        {/* Top: Logo */}
                        <div className="flex justify-between items-start animate-fadeInDown">
                          <div className="text-xs font-semibold opacity-80 tracking-wider">VISA</div>
                          <div className="flex items-center gap-1">
                            <div className="w-7 h-7 rounded-full bg-red-500 opacity-80 animate-pulse"></div>
                            <div className="w-7 h-7 rounded-full bg-yellow-500 opacity-80 -ml-2 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>

                        {/* Middle: Chip y número */}
                        <div className="animate-fadeInUp">
                          <div className="w-10 h-8 mb-6 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded flex items-center justify-center text-xs font-bold text-gray-800 opacity-90 shadow-md">
                            IC
                          </div>
                          <div className="text-2xl font-mono tracking-widest font-bold">
                            {cardData.numero 
                              ? cardData.numero.replace(/\d{4}(?=\d)/g, '$& ')
                              : '•••• •••• •••• ••••'
                            }
                          </div>
                        </div>

                        {/* Bottom: Info */}
                        <div className="flex justify-between items-end animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                          <div>
                            <div className="text-xs opacity-70 mb-1">CARDHOLDER</div>
                            <div className="text-sm font-semibold uppercase tracking-wider">
                              {cardData.titular || 'YOUR NAME'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs opacity-70 mb-1">VALID THRU</div>
                            <div className="text-lg font-mono font-bold">
                              {cardData.mes ? (cardData.mes < 10 ? '0' + cardData.mes : cardData.mes) : 'MM'}/{cardData.ano ? cardData.ano.slice(-2) : 'YY'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ATRÁS - Reverso */}
                    <div
                      className="absolute w-full h-full rounded-2xl shadow-xl p-4 text-white"
                      style={{
                        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 50%, #16213e 100%)',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                      }}
                    >
                      {/* Banda magnética */}
                      <div className="w-full h-12 bg-black rounded mt-4 mb-8"></div>
                      
                      {/* CVV */}
                      <div className="w-full bg-gray-300 rounded p-2 flex justify-end items-center">
                        <div className="text-right">
                          <div className="text-xs text-gray-700 font-semibold mb-1">CVC</div>
                          <div className="text-lg font-mono font-bold text-gray-900 tracking-widest">
                            {cardData.cvv || '•••'}
                          </div>
                        </div>
                      </div>

                      {/* Firma */}
                      <div className="mt-8 border-b-2 border-white opacity-60"></div>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* DERECHA - Formulario y métodos */}
              <div className={`flex flex-col justify-center space-y-6 ${metodo === 'Tarjeta' ? 'animate-fadeInRight' : 'animate-fadeInUp'}`}>
                {/* Métodos de pago - Horizontal minimalista */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4 animate-fadeInDown">Método de pago</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setMetodo('Tarjeta')}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        metodo === 'Tarjeta'
                          ? 'bg-green-800 text-white shadow-lg scale-105 animate-scaleIn'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                      }`}
                    >
                      <FaCreditCard size={18} />
                      <span>Tarjeta</span>
                    </button>
                    <button
                      onClick={() => setMetodo('Efectivo')}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        metodo === 'Efectivo'
                          ? 'bg-green-800 text-white shadow-lg scale-105 animate-scaleIn'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                      }`}
                    >
                      <FaMoneyBillWave size={18} />
                      <span>Efectivo</span>
                    </button>
                    <button
                      onClick={() => setMetodo('Transferencia')}
                      className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        metodo === 'Transferencia'
                          ? 'bg-green-800 text-white shadow-lg scale-105 animate-scaleIn'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                      }`}
                    >
                      <FaExchangeAlt size={18} />
                      <span>Transferencia</span>
                    </button>
                  </div>
                </div>

                {/* Formulario de tarjeta */}
                {metodo === 'Tarjeta' && (
                  <div className="space-y-3 animate-fadeInUp">
                    <div className="animate-slideInLeft">
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">Número</label>
                      <input
                        type="text"
                        name="numero"
                        value={cardData.numero ? cardData.numero.replace(/\d{4}(?=\d)/g, '$& ') : ''}
                        onChange={handleCardChange}
                        placeholder="0000 0000 0000 0000"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent text-gray-900 bg-white font-mono text-sm transition-all hover:shadow-md"
                        maxLength="19"
                      />
                    </div>

                    <div className="animate-slideInLeft" style={{ animationDelay: '0.1s' }}>
                      <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">Titular</label>
                      <input
                        type="text"
                        name="titular"
                        value={cardData.titular}
                        onChange={handleCardChange}
                        placeholder="JUAN PEREZ"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent text-gray-900 bg-white uppercase text-sm transition-all hover:shadow-md"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 animate-slideInLeft" style={{ animationDelay: '0.2s' }}>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">Mes</label>
                        <input
                          type="text"
                          name="mes"
                          value={cardData.mes}
                          onChange={handleCardChange}
                          placeholder="MM"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent text-gray-900 bg-white text-center font-mono text-sm transition-all hover:shadow-md"
                          maxLength="2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">Año</label>
                        <input
                          type="text"
                          name="ano"
                          value={cardData.ano}
                          onChange={handleCardChange}
                          placeholder="YY"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent text-gray-900 bg-white text-center font-mono text-sm transition-all hover:shadow-md"
                          maxLength="4"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          placeholder="•••"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent text-gray-900 bg-white text-center font-mono text-sm transition-all hover:shadow-md"
                          maxLength="3"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {metodo === 'Efectivo' && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg animate-fadeInUp animate-slideInUp">
                    <p className="text-sm text-blue-900">Se confirmará en el lugar del torneo</p>
                  </div>
                )}

                {metodo === 'Transferencia' && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg animate-fadeInUp animate-slideInUp">
                    <p className="text-sm text-purple-900">Datos por correo electrónico</p>
                  </div>
                )}

                {/* Monto y botones */}
                <div className="space-y-4 pt-4 border-t border-gray-200 animate-fadeInUp">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Monto total</span>
                    <span className="text-2xl font-bold text-gray-900 animate-pulse">${parseFloat(costo).toFixed(2)}</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onCancel}
                      disabled={procesando}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition disabled:opacity-50 text-sm hover:scale-105 active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleProcesar}
                      disabled={procesando}
                      className="flex-1 px-4 py-2.5 bg-green-800 hover:bg-green-900 text-white rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm hover:shadow-lg hover:scale-105 active:scale-95"
                    >
                      {procesando ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <FaLock size={14} />
                          Pagar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Mensaje de éxito
            <div className="py-16 text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 animate-ping bg-green-400 rounded-full opacity-75"></div>
                <div className="relative w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">¡Pago Exitoso!</h3>
                <p className="text-gray-600 mt-1 text-sm">Tu transacción fue procesada correctamente</p>
                <p className="text-xs text-gray-500 mt-2">Completando inscripción...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
