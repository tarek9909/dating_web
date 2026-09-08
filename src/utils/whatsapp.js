// Dynamic WhatsApp URL and Summary generator with fallback to original Dana defaults
const DEFAULT_PHONE = '96171273152';

export function getWhatsAppUrl({
  location,
  food,
  time = '6:00 PM',
  date = 'Tomorrow',
  dressCode = 'Casual',
  phone = DEFAULT_PHONE,
  recipientName = 'Dana'
}) {
  const cleanPhone = String(phone || DEFAULT_PHONE).replace(/[^0-9]/g, '');
  const message = `Hey ${recipientName}! ❤️ It's official - I said YES! 🥂✨

Here are our date plans:
📍 Location: ${location || 'Rooftop'}
🍽️ Food: ${food || 'Lebanese'}
📅 Date: ${date}
⏰ Time: ${time}
👕 Dress Code: ${dressCode}

See you! No backing out now 😌❤️`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/+${cleanPhone}?text=${encoded}`;
}

export function getDateSummaryText({
  location,
  food,
  time = '6:00 PM',
  date = 'Tomorrow',
  dressCode = 'Casual',
  recipientName = 'Dana'
}) {
  return `Hey ${recipientName}! ❤️ It's official - I said YES! 🥂✨\n\n📍 Location: ${location || 'Rooftop'}\n🍽️ Food: ${food || 'Lebanese'}\n📅 Date: ${date}\n⏰ Time: ${time}\n👕 Dress Code: ${dressCode}\n\nSee you! No backing out now 😌❤️`;
}

