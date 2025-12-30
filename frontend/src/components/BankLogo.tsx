interface BankLogoProps {
  bank: string;
  size?: number;
}

export function BankLogo({ bank, size = 32 }: BankLogoProps) {
  const bankName = bank.toLowerCase();

  // Cores dos bancos brasileiros
  const bankColors: { [key: string]: string } = {
    'banco do brasil': '#FFF200',
    'bb': '#FFF200',
    'caixa': '#0066B3',
    'caixa econômica': '#0066B3',
    'bradesco': '#CC092F',
    'itaú': '#EC7000',
    'itau': '#EC7000',
    'santander': '#EC0000',
    'nubank': '#820AD1',
    'nu': '#820AD1',
  };

  // Iniciais dos bancos
  const bankInitials: { [key: string]: string } = {
    'banco do brasil': 'BB',
    'bb': 'BB',
    'caixa': 'CEF',
    'caixa econômica': 'CEF',
    'bradesco': 'BR',
    'itaú': 'IT',
    'itau': 'IT',
    'santander': 'ST',
    'nubank': 'NU',
    'nu': 'NU',
  };

  const color = bankColors[bankName] || '#667eea';
  const initials = bankInitials[bankName] || bank.substring(0, 2).toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '8px',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.4,
        color: '#fff',
        textShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }}
    >
      {initials}
    </div>
  );
}
