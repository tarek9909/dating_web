import React, { useState, useEffect } from 'react';
import { X, Search, Sparkles, Check, Compass, PlusCircle, Image as ImageIcon, Layers } from 'lucide-react';
import { sound } from '../utils/sound';

export const CURATED_ACTIVITIES = [
  {
    id: 'arcade_vr',
    name: 'Retro Arcade & VR Battles',
    tag: 'Gaming & Laughs 🕹️',
    emoji: '🕹️',
    category: 'fun',
    description: 'Neon retro arcade, air hockey, Mario Kart battle w VR simulation.',
    imageUrl: '/gifs/loc_hawana.gif',
  },
  {
    id: 'glow_bowling',
    name: 'Cosmic Glow Bowling & Billiards',
    tag: 'Friendly Competition 🎳',
    emoji: '🎳',
    category: 'fun',
    description: 'Glow-in-the-dark strikes, pool tables, cocktails w competitive laughs.',
    imageUrl: '/gifs/loc_hawana.gif',
  },
  {
    id: 'pottery_wheel',
    name: 'Clay Pottery Wheel Workshop',
    tag: 'Creative & Hands-On 🏺',
    emoji: '🏺',
    category: 'creative',
    description: 'Sculpting clay mugs and vases together 3al daw l hawa2i with private instructor.',
    imageUrl: '/gifs/loc_skymate.gif',
  },
  {
    id: 'paint_sip',
    name: 'Canvas Paint & Sip Wine Night',
    tag: 'Art & Wine 🎨',
    emoji: '🎨',
    category: 'creative',
    description: 'Painting matching canvases, red wine glasses w cozy acoustic lo-fi vibes.',
    imageUrl: '/gifs/loc_skymate.gif',
  },
  {
    id: 'gokart_racing',
    name: 'Go-Kart Racing Grand Prix',
    tag: 'Adrenaline & Speed 🏎️',
    emoji: '🏎️',
    category: 'adventure',
    description: 'High-speed indoor circuit racing, overtaking maneuvers w winner podium photo.',
    imageUrl: '/gifs/loc_hawana.gif',
  },
  {
    id: 'sunset_kayak',
    name: 'Sunset Sea Kayaking & SUP',
    tag: 'Coastline Adventure 🌊',
    emoji: '🚣',
    category: 'adventure',
    description: 'Paddleboarding along Batroun or Byblos ancient sea walls at golden hour.',
    imageUrl: '/gifs/loc_jia.gif',
  },
  {
    id: 'rooftop_cinema',
    name: 'Rooftop Open-Air Cinema',
    tag: 'Under The Stars 🍿',
    emoji: '🍿',
    category: 'romantic',
    description: 'Plush beanbags under the stars, warm fleece blankets, gourmet popcorn w cult movie.',
    imageUrl: '/gifs/loc_skymate.gif',
  },
  {
    id: 'escape_room',
    name: 'Mystery Detective Escape Room',
    tag: 'Puzzle Adventure 🧩',
    emoji: '🧩',
    category: 'fun',
    description: 'Solving secret detective clues together against a ticking 60-minute countdown.',
    imageUrl: '/gifs/loc_hawana.gif',
  },
  {
    id: 'karaoke_vip',
    name: 'Private VIP Karaoke Room',
    tag: 'Singing & Nostalgia 🎤',
    emoji: '🎤',
    category: 'fun',
    description: 'Belt out 2000s Arabic pop hits & throwback jams without anyone judging.',
    imageUrl: '/gifs/final_date.gif',
  },
  {
    id: 'boardgame_cafe',
    name: 'Board Game Café & Iced Boba',
    tag: 'Chill & Strategy 🎲',
    emoji: '🎲',
    category: 'fun',
    description: 'Catan, Exploding Kittens, brown sugar bubble tea w cozy corner seating.',
    imageUrl: '/gifs/food_sandwiches.gif',
  },
  {
    id: 'cliff_hike',
    name: 'Golden Hour Cliff Hike & Picnic',
    tag: 'Scenic Romance 🌄',
    emoji: '🌄',
    category: 'romantic',
    description: 'Scenic cliff trail overlooking the Mediterranean, cheese board w mountain breeze.',
    imageUrl: '/gifs/loc_jia.gif',
  },
  {
    id: 'coffee_bookstore',
    name: 'Vintage Bookshop & Specialty Coffee',
    tag: 'Cozy & Acoustic ☕',
    emoji: '☕',
    category: 'romantic',
    description: 'Browsing vintage books and vinyls, flat whites w deep conversations.',
    imageUrl: '/gifs/food_sandwiches.gif',
  },
  {
    id: 'cooking_class',
    name: 'Interactive Pasta & Pizza Masterclass',
    tag: 'Culinary Fun 👨‍🍳',
    emoji: '👨‍🍳',
    category: 'creative',
    description: 'Tossing fresh dough, making handmade ravioli w chef aprons together.',
    imageUrl: '/gifs/food_italian.gif',
  },
  {
    id: 'stargazing',
    name: 'Mountain Stargazing & Telescopes',
    tag: 'Celestial Magic 🔭',
    emoji: '🔭',
    category: 'romantic',
    description: 'High altitude mountain clearing, telescope view of Saturn rings w hot cider.',
    imageUrl: '/gifs/loc_skymate.gif',
  },
  {
    id: 'corniche_gelato',
    name: 'Sunset Corniche Kazdara & Gelato',
    tag: 'Classic Beirut 🍦',
    emoji: '🍦',
    category: 'romantic',
    description: 'Sea walk along Beirut Corniche, sunset breeze w double scoop pistachio gelato.',
    imageUrl: '/gifs/food_sandwiches.gif',
  },
  {
    id: 'dessert_tasting',
    name: 'Choco Fondue & Dessert Tasting',
    tag: 'Sweet Tooth 🍫',
    emoji: '🍫',
    category: 'romantic',
    description: 'Belgian melted chocolate fountain, strawberries, marshmallows & artisanal waffles.',
    imageUrl: '/gifs/food_sandwiches.gif',
  },
  {
    id: 'roller_disco',
    name: 'Retro Roller Skating Disco',
    tag: 'Groovy & Energy 🛼',
    emoji: '🛼',
    category: 'fun',
    description: 'Vintage 80s neon roller rink, disco beats, holding hands & laughs.',
    imageUrl: '/gifs/loc_hawana.gif',
  },
  {
    id: 'batroun_kazdara',
    name: 'Batroun Bike Tour & Lemonade',
    tag: 'Coastal Breeze 🚲',
    emoji: '🚲',
    category: 'adventure',
    description: 'Cruising old Batroun alleys on retro bikes, fresh Hilmi lemonade stop.',
    imageUrl: '/gifs/loc_jia.gif',
  },
];

const CATEGORIES = [
  { id: 'all', label: '🌟 Kel L Anshita' },
  { id: 'fun', label: '🕹️ De7ek w Games' },
  { id: 'creative', label: '🎨 Fann w Crafting' },
  { id: 'adventure', label: '🏎️ Adrenaline w Bahr' },
  { id: 'romantic', label: '✨ Romantic w Rawa2' },
];

const GIF_PRESETS = [
  { label: '🕹️ Arcade / Games', url: '/gifs/loc_hawana.gif' },
  { label: '🍷 Romantic Skymate', url: '/gifs/loc_skymate.gif' },
  { label: '🌊 Batroun / Beach', url: '/gifs/loc_jia.gif' },
  { label: '🍕 Food / Italian', url: '/gifs/food_italian.gif' },
  { label: '🥪 Cozy / Sandwiches', url: '/gifs/food_sandwiches.gif' },
  { label: '🇱🇧 Lebanese Feast', url: '/gifs/food_lebanese.gif' },
  { label: '🥂 Celebration Love', url: '/gifs/final_date.gif' },
];

export default function ActivityPickerModal({
  isOpen,
  onClose,
  onSelectActivity,
  title = 'Ekhtar Nashat Khass • Choose Custom Activity',
  slotLabel = 'Card',
  slotOptions = [],
  initialSlotIndex = 0,
}) {
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [activeSlot, setActiveSlot] = useState(initialSlotIndex);

  const [customForm, setCustomForm] = useState({
    name: '',
    tag: 'Custom Activity ✨',
    emoji: '🎯',
    description: '',
    imageUrl: '/gifs/loc_hawana.gif',
  });

  useEffect(() => {
    if (isOpen) {
      setActiveSlot(initialSlotIndex || 0);
      setSelectedItem(null);
      setIsCustomMode(false);
    }
  }, [isOpen, initialSlotIndex]);

  if (!isOpen) return null;

  const filtered = CURATED_ACTIVITIES.filter(act => {
    const matchesCat = selectedCat === 'all' || act.category === selectedCat;
    const matchesSearch = !search ||
      act.name.toLowerCase().includes(search.toLowerCase()) ||
      act.tag.toLowerCase().includes(search.toLowerCase()) ||
      act.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handlePickCurated = (act) => {
    sound.playPop();
    setSelectedItem(act);
    setIsCustomMode(false);
  };

  const handleConfirm = () => {
    if (isCustomMode) {
      if (!customForm.name.trim()) return;
      onSelectActivity({
        name: customForm.name.trim(),
        tag: customForm.tag.trim() || 'Custom Activity 🎯',
        emoji: customForm.emoji.trim() || '🎯',
        description: customForm.description.trim() || 'Custom date activity.',
        imageUrl: customForm.imageUrl || '/gifs/loc_hawana.gif',
      }, activeSlot);
    } else if (selectedItem) {
      onSelectActivity(selectedItem, activeSlot);
    }
    sound.playCelebration();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-[0_25px_70px_rgba(185,0,64,0.2)] border border-rose-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/80 via-white to-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
                {title}
              </h3>
              <p className="text-[11px] text-on-surface-variant font-medium flex items-center gap-1.5 mt-0.5">
                <span>Applying to:</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-primary font-bold">
                  {slotOptions.length > 0
                    ? slotOptions.find(s => s.index === activeSlot)?.label || slotLabel
                    : slotLabel}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-on-surface-variant flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Slot Target Selector (if multiple slots available) */}
        {slotOptions.length > 1 && (
          <div className="px-5 py-2.5 bg-rose-50/40 border-b border-rose-100 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-on-surface-variant shrink-0 flex items-center gap-1">
              <Layers size={13} className="text-primary" />
              <span>Target Card:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {slotOptions.map((opt) => (
                <button
                  key={opt.index}
                  type="button"
                  onClick={() => {
                    setActiveSlot(opt.index);
                    sound.playPop();
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeSlot === opt.index
                      ? 'bg-primary text-white shadow-xs scale-102'
                      : 'bg-white border border-rose-200 text-on-surface-variant hover:border-primary/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search & Mode Switcher */}
        <div className="p-4 sm:p-5 border-b border-rose-100 bg-white flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Fattesh 3an nashat (Arcade, Bowling, Pottery, Kayak...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-rose-50/40 border border-rose-200 text-xs font-semibold text-on-surface outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-on-surface-variant/50"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCustomMode(!isCustomMode);
                setSelectedItem(null);
                sound.playPop();
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                isCustomMode
                  ? 'bg-primary text-white shadow-rose-500/20'
                  : 'bg-rose-50 border border-rose-200 text-primary hover:bg-rose-100'
              }`}
            >
              <PlusCircle size={14} />
              <span>{isCustomMode ? 'Show Curated Presets' : '+ Type Custom Activity'}</span>
            </button>
          </div>

          {/* Category Tabs (only in curated mode) */}
          {!isCustomMode && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCat(cat.id);
                    sound.playPop();
                  }}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCat === cat.id
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-rose-50/70 border border-rose-200/70 text-on-surface-variant hover:border-primary hover:text-primary'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {isCustomMode ? (
            <div className="flex flex-col gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/40 border border-rose-200 flex flex-col gap-3.5">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                  <Sparkles size={14} />
                  <span>Create Custom Activity Card</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                    Activity Name • Esem L Nashat *
                  </label>
                  <input
                    type="text"
                    value={customForm.name}
                    onChange={(e) => setCustomForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Vintage Record Shopping & Donuts"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-on-surface outline-none focus:border-primary shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                      Tag / Category • L Vibe
                    </label>
                    <input
                      type="text"
                      value={customForm.tag}
                      onChange={(e) => setCustomForm(p => ({ ...p, tag: e.target.value }))}
                      placeholder="e.g. Music & Sugar 🍩"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-xs text-on-surface outline-none focus:border-primary shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                      Emoji Icon
                    </label>
                    <input
                      type="text"
                      value={customForm.emoji}
                      onChange={(e) => setCustomForm(p => ({ ...p, emoji: e.target.value }))}
                      placeholder="e.g. 🍩"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-xs text-center text-on-surface outline-none focus:border-primary shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                    Description • L Shar7
                  </label>
                  <textarea
                    rows={2}
                    value={customForm.description}
                    onChange={(e) => setCustomForm(p => ({ ...p, description: e.target.value }))}
                    placeholder="e.g. Digging for vinyls at Mar Mikhael then fresh cinnamon glazed donuts."
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-xs text-on-surface outline-none focus:border-primary shadow-xs resize-none"
                  />
                </div>

                {/* GIF / Image Selection for Custom Activity */}
                <div>
                  <label className="block text-[11px] font-bold text-on-surface-variant mb-1.5 flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-primary" />
                    <span>Card GIF / Image Animation:</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2.5">
                    {GIF_PRESETS.map((g, gIdx) => (
                      <button
                        key={gIdx}
                        type="button"
                        onClick={() => {
                          setCustomForm(p => ({ ...p, imageUrl: g.url }));
                          sound.playPop();
                        }}
                        className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          customForm.imageUrl === g.url
                            ? 'bg-rose-100 border-primary text-primary shadow-xs'
                            : 'bg-white border-rose-200 text-on-surface-variant hover:border-rose-300'
                        }`}
                      >
                        <span>{g.label}</span>
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customForm.imageUrl}
                    onChange={(e) => setCustomForm(p => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="or enter custom GIF URL (/gifs/...)"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-xs text-on-surface outline-none focus:border-primary shadow-xs"
                  />
                </div>
              </div>

              {/* Live Card Preview */}
              <div className="p-4 rounded-2xl bg-white border border-rose-200/90 shadow-sm flex items-start gap-3">
                <img
                  src={customForm.imageUrl || '/gifs/loc_hawana.gif'}
                  alt={customForm.name || 'Custom Activity'}
                  className="w-20 h-20 rounded-xl object-cover border border-rose-200 shrink-0 shadow-xs"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                      {customForm.tag || 'Custom Activity ✨'}
                    </span>
                    <span className="text-base">{customForm.emoji || '🎯'}</span>
                  </div>
                  <h4 className="text-xs font-bold text-on-surface">
                    {customForm.name || 'Activity Title Preview'}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">
                    {customForm.description || 'Activity description preview will appear here.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((act) => {
                const isSelected = selectedItem?.id === act.id;
                return (
                  <div
                    key={act.id}
                    onClick={() => handlePickCurated(act)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 relative group ${
                      isSelected
                        ? 'border-primary bg-rose-50/80 shadow-md ring-2 ring-primary/20 scale-[1.01]'
                        : 'border-rose-100 bg-white hover:border-rose-300 hover:bg-rose-50/30 shadow-xs'
                    }`}
                  >
                    <img
                      src={act.imageUrl}
                      alt={act.name}
                      className="w-16 h-16 rounded-xl object-cover border border-rose-200 shrink-0 shadow-xs group-hover:scale-105 transition-transform"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-primary uppercase tracking-wider mb-0.5">
                        {act.tag}
                      </span>
                      <h4 className="text-xs font-bold text-on-surface line-clamp-1">
                        {act.name}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-rose-100 bg-white flex items-center justify-between gap-3">
          <div className="text-xs text-on-surface-variant truncate">
            {isCustomMode ? (
              <span>Custom: <strong>{customForm.name || 'Type name above...'}</strong></span>
            ) : selectedItem ? (
              <span>Selected: <strong className="text-primary">{selectedItem.name}</strong></span>
            ) : (
              <span>Na22i ayya nashat men l list aw 3abbi custom</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-rose-200 text-xs font-semibold text-on-surface-variant hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isCustomMode ? !customForm.name.trim() : !selectedItem}
              onClick={handleConfirm}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-primary to-rose-600 text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              Apply to {slotOptions.length > 0 ? (slotOptions.find(s => s.index === activeSlot)?.label || `Card #${activeSlot + 1}`) : slotLabel} ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
