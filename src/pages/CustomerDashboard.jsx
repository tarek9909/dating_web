import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Globe, Eye, Copy, Check, LogOut, Save,
  Calendar, Shirt, AlertCircle, CheckCircle2,
  ExternalLink, Heart, MapPin, Compass, Plus, Trash2, Image as ImageIcon, Lock,
  ArrowRight, ShieldCheck, Zap, MessageSquare, Palette, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import GifPickerModal from '../components/GifPickerModal';
import ActivityPickerModal from '../components/ActivityPickerModal';
import { generateHoursRange } from '../components/ScreenWhen';
import { sound } from '../utils/sound';
import gsap from 'gsap';

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('proposal'); // 'proposal' | 'venues' | 'options' | 'schedule' | 'dress' | 'final' | 'theme'

  // Invitation state
  const [invitation, setInvitation] = useState(null);
  const [selectedThemeId, setSelectedThemeId] = useState(1);
  const [customAccentColor, setCustomAccentColor] = useState('');
  const [content, setContent] = useState({
    openingText: '',
    questionText: '',
    yesButtonText: 'YES ❤️',
    noButtonText: 'NO',
    angry: { title: '', message: '', button: '' },
    sectionTitles: { locations: '', food: '', when: '', dressCode: '' },
    subtitles: { locations: '', food: '', when: '', dressCode: '' },
    categoryType: 'food',
    final: { title: '', message: '' }
  });

  const [locations, setLocations] = useState([]);
  const [options, setOptions] = useState([]);
  const [scheduleConfig, setScheduleConfig] = useState({
    mode: 'strict',
    text: 'Tomorrow',
    time: '6:00 PM',
    startTime: '6:00 PM',
    endTime: '11:00 PM',
  });
  const [dressConfig, setDressConfig] = useState({
    value: 'Casual',
    quote: 'Nothing too serious. Just look cute.',
    checklist: ['Clean kicks & cozy vibes', 'Fragrance on point', 'Your best smile (mandatory)'],
  });
  const [newChecklistItem, setNewChecklistItem] = useState('');

  // Media slots
  const [mediaSlots, setMediaSlots] = useState({
    openingGif: '/gifs/invitation_pleading.gif',
    angryGif: '/gifs/angry_strike_3.gif',
    whenGif: '/gifs/when_tomorrow.gif',
    dressGif: '/gifs/dress_casual.gif',
    finalGif: '/gifs/final_date.gif',
  });

  // GIF Picker Modal state
  const [gifPicker, setGifPicker] = useState({
    open: false,
    title: '',
    targetType: '', // 'mediaSlot' | 'location' | 'option'
    targetIndex: null,
    targetField: '',
    currentUrl: '',
  });

  // Activity Picker Modal state
  const [activityPicker, setActivityPicker] = useState({
    open: false,
    title: '',
    targetType: '', // 'location' | 'option'
    targetIndex: 0,
    slotLabel: '',
  });

  const [stats, setStats] = useState({ views: 0, yesClicks: 0, noClicks: 0, rsvpShares: 0 });

  const THEME_OPTIONS = [
    {
      id: 1,
      slug: 'romantic-velvet',
      name: 'Romantic Velvet',
      badge: 'Velvet L Romance ❤️',
      description: 'Burgundy faye7 ma3 rose pink glow w glassmorphism classy.',
      primaryColor: '#ff4d6d',
      secondaryColor: '#ff758f',
      backgroundColor: '#0f0207',
      wine: '#220412',
      burgundy: '#3a0820',
      glow: '0 0 25px rgba(255, 77, 109, 0.45)',
    },
    {
      id: 2,
      slug: 'midnight-sapphire',
      name: 'Midnight Sapphire',
      badge: 'Layl Beirut wl Sapphire 🌌',
      description: 'Kohl leyl ma3 electric blue starlight romantic vibes.',
      primaryColor: '#38bdf8',
      secondaryColor: '#818cf8',
      backgroundColor: '#030712',
      wine: '#0c1938',
      burgundy: '#172554',
      glow: '0 0 25px rgba(56, 189, 248, 0.5)',
    },
    {
      id: 3,
      slug: 'emerald-enchantment',
      name: 'Emerald Enchantment',
      badge: 'Ghabet L Zomorrod 🌲',
      description: 'Zomorrod ghame2 ma3 mint glow w touch dahabi.',
      primaryColor: '#10b981',
      secondaryColor: '#34d399',
      backgroundColor: '#021a0e',
      wine: '#042f2e',
      burgundy: '#064e3b',
      glow: '0 0 25px rgba(16, 185, 129, 0.5)',
    },
    {
      id: 4,
      slug: 'amethyst-dream',
      name: 'Amethyst Dream',
      badge: '7elm L Banafsaj 🔮',
      description: 'Violet malaki sa7er ma3 lavender starlight neon.',
      primaryColor: '#c084fc',
      secondaryColor: '#e879f9',
      backgroundColor: '#0c0217',
      wine: '#2e1065',
      burgundy: '#3b0764',
      glow: '0 0 25px rgba(192, 132, 252, 0.5)',
    },
    {
      id: 5,
      slug: 'golden-champagne',
      name: 'Golden Champagne',
      badge: 'Dahab L Champagne 🥂',
      description: 'Nour sham3a dafi ma3 espresso velvet fakhim.',
      primaryColor: '#f59e0b',
      secondaryColor: '#fbbf24',
      backgroundColor: '#140a02',
      wine: '#451a03',
      burgundy: '#78350f',
      glow: '0 0 25px rgba(245, 158, 11, 0.5)',
    },
    {
      id: 6,
      slug: 'sunset-coral',
      name: 'Sunset Coral',
      badge: 'Ghroub L Coral 🌅',
      description: 'Ghroub Batroun dafi ma3 terracotta w peachy blush.',
      primaryColor: '#f97316',
      secondaryColor: '#fb923c',
      backgroundColor: '#170503',
      wine: '#431407',
      burgundy: '#7c2d12',
      glow: '0 0 25px rgba(249, 115, 22, 0.5)',
    },
  ];

  const QUICK_ACCENTS = [
    { name: 'Rose Pink', color: '#ff4d6d' },
    { name: 'Electric Sky', color: '#38bdf8' },
    { name: 'Mint Emerald', color: '#10b981' },
    { name: 'Starlight Violet', color: '#c084fc' },
    { name: 'Champagne Gold', color: '#f59e0b' },
    { name: 'Sunset Coral', color: '#f97316' },
    { name: 'Hot Magenta', color: '#ec4899' },
    { name: 'Deep Indigo', color: '#6366f1' },
  ];

  const VENUE_PRESETS = [
    { name: 'Sunset bi Batroun', tag: 'Romantic Coast 🌅', description: 'Cozy sea breeze, lemonades w a7la ghroub bi Lebnan.', imageUrl: '/gifs/loc_skymate.gif' },
    { name: 'Mar Mikhael Nightlife', tag: 'Vibrant & Trendy 🍸', description: 'Cocktails, music, w mashehad 7elo bayn l shaware3 l qadimeh.', imageUrl: '/gifs/loc_cozy.gif' },
    { name: 'Byblos Old Port & Citadel', tag: 'Historic Charm ⛵', description: '3asha 3al mina w mashwar romantic bayn l 7jar l feniqiyeh.', imageUrl: '/gifs/loc_view.gif' },
    { name: 'Raouche Sea Cliff Walk', tag: 'Beirut Vibes 🌊', description: 'Mansar l sakhertein ma3 3aseer fresh w cozy street vibes.', imageUrl: '/gifs/loc_skymate.gif' },
  ];

  const OPTION_PRESETS = [
    { name: 'Neapolitan Woodfired Pizza', emoji: '🍕', tag: 'Italian Craving 🍕', description: 'Crispy crust, melted burrata, w cozy Italian date ambiance.', imageUrl: '/gifs/food_italian.gif' },
    { name: 'Authentic Lebanese Mashawi & Mezze', emoji: '🥩', tag: 'Elite Feast 🇱🇧', description: 'Tabbouleh, hummus, taouk fresh, w mezza lebneniyeh 3al osoul.', imageUrl: '/gifs/food_lebanese.gif' },
    { name: 'Crepes & Artisan Gelato Run', emoji: '🍦', tag: 'Sweet Tooth 🍦', description: 'Nutella loaded crepes w pistachio gelato 3al mashye.', imageUrl: '/gifs/food_sandwiches.gif' },
    { name: 'Smash Burgers & Truffle Fries', emoji: '🍔', tag: 'Comfort Food 🍔', description: 'Juicy double patty, brioche bun, w dirty fries.', imageUrl: '/gifs/food_sandwiches.gif' },
  ];

  const ACTIVITY_PRESETS = [
    { name: 'Retro Arcade & VR Battles', tag: 'Gaming & Laughs 🕹️', emoji: '🕹️', description: 'Neon retro arcade, air hockey, Mario Kart battle w VR simulation.', imageUrl: '/gifs/loc_hawana.gif' },
    { name: 'Cosmic Glow Bowling', tag: 'Friendly Competition 🎳', emoji: '🎳', description: 'Glow-in-the-dark strikes, pool tables, cocktails w competitive laughs.', imageUrl: '/gifs/loc_hawana.gif' },
    { name: 'Clay Pottery Wheel Workshop', tag: 'Creative & Hands-On 🏺', emoji: '🏺', description: 'Sculpting clay mugs and vases together 3al daw l hawa2i with private instructor.', imageUrl: '/gifs/loc_skymate.gif' },
    { name: 'Canvas Paint & Sip Wine Night', tag: 'Art & Wine 🎨', emoji: '🎨', description: 'Painting matching canvases, red wine glasses w cozy acoustic lo-fi vibes.', imageUrl: '/gifs/loc_skymate.gif' },
    { name: 'Go-Kart Racing Grand Prix', tag: 'Adrenaline & Speed 🏎️', emoji: '🏎️', description: 'High-speed indoor circuit racing, overtaking maneuvers w winner podium photo.', imageUrl: '/gifs/loc_hawana.gif' },
    { name: 'Sunset Batroun Sea Kayaking', tag: 'Coastline Adventure 🌊', emoji: '🚣', description: 'Paddleboarding along Batroun ancient sea walls at golden hour.', imageUrl: '/gifs/loc_jia.gif' },
    { name: 'Rooftop Open-Air Cinema', tag: 'Under The Stars 🍿', emoji: '🍿', description: 'Plush beanbags under the stars, warm fleece blankets w gourmet popcorn.', imageUrl: '/gifs/loc_skymate.gif' },
    { name: 'Mystery Detective Escape Room', tag: 'Puzzle Adventure 🧩', emoji: '🧩', description: 'Solving secret detective clues together against a ticking 60-minute countdown.', imageUrl: '/gifs/loc_hawana.gif' },
  ];

  const handleApplyVenuePreset = (preset, index) => {
    setLocations(prev => prev.map((loc, i) => i === index ? {
      ...loc,
      name: preset.name,
      tag: preset.tag,
      description: preset.description,
      imageUrl: preset.imageUrl || loc.imageUrl
    } : loc));
    sound.playPop();
  };

  const handleApplyOptionPreset = (preset, index) => {
    setOptions(prev => prev.map((opt, i) => i === index ? {
      ...opt,
      name: preset.name,
      emoji: preset.emoji,
      tag: preset.tag || opt.tag,
      description: preset.description,
      imageUrl: preset.imageUrl || opt.imageUrl
    } : opt));
    sound.playPop();
  };

  const handleApplyActivityPresetToLocation = (preset, index) => {
    setLocations(prev => prev.map((loc, i) => i === index ? {
      ...loc,
      name: preset.name,
      tag: preset.tag,
      description: preset.description,
      imageUrl: preset.imageUrl || loc.imageUrl
    } : loc));
    sound.playPop();
  };

  const handleApplyActivityPresetToOption = (preset, index) => {
    setOptions(prev => prev.map((opt, i) => i === index ? {
      ...opt,
      name: preset.name,
      emoji: preset.emoji || '🎯',
      tag: preset.tag,
      description: preset.description,
      imageUrl: preset.imageUrl || opt.imageUrl
    } : opt));
    setContent(prev => ({
      ...prev,
      categoryType: prev.categoryType === 'food' ? 'activity' : prev.categoryType,
      sectionTitles: {
        ...prev.sectionTitles,
        food: prev.sectionTitles.food === 'Sho 3abalna nekol? 🍕' || !prev.sectionTitles.food ? 'Sho badna na3mel? 🎯' : prev.sectionTitles.food,
      },
      subtitles: {
        ...prev.subtitles,
        food: prev.subtitles.food === 'Food speaks louder than words. Pick your craving:' || !prev.subtitles.food ? 'Pick the activity you are most excited for:' : prev.subtitles.food,
      }
    }));
    sound.playPop();
  };

  const handleOpenActivityPicker = (targetType, targetIndex = 0, slotLabel = '') => {
    const defaultLabel = targetType === 'location'
      ? `Screen 2 • Card #${targetIndex + 1}`
      : `Screen 3 • Card #${targetIndex + 1}`;
    const defaultTitle = targetType === 'location'
      ? 'Ekhtar Nashat Khass L Mar7aleh 2 • Screen 2 Custom Activity'
      : 'Ekhtar Nashat Khass L Mar7aleh 3 • Screen 3 Custom Activity';
    setActivityPicker({
      open: true,
      title: defaultTitle,
      targetType,
      targetIndex,
      slotLabel: slotLabel || defaultLabel,
    });
  };

  const handleActivitySelected = (activity, slotIndex = null) => {
    const targetIdx = typeof slotIndex === 'number' ? slotIndex : activityPicker.targetIndex;
    if (activityPicker.targetType === 'location') {
      setLocations(prev => prev.map((loc, idx) => idx === targetIdx ? {
        ...loc,
        name: activity.name,
        tag: activity.tag || 'Custom Activity 🎯',
        description: activity.description,
        imageUrl: activity.imageUrl || loc.imageUrl,
      } : loc));
    } else if (activityPicker.targetType === 'option') {
      setOptions(prev => prev.map((opt, idx) => idx === targetIdx ? {
        ...opt,
        name: activity.name,
        emoji: activity.emoji || '🎯',
        tag: activity.tag || 'Custom Activity 🎯',
        description: activity.description,
        imageUrl: activity.imageUrl || opt.imageUrl,
      } : opt));
      setContent(prev => ({
        ...prev,
        categoryType: prev.categoryType === 'food' ? 'activity' : prev.categoryType,
        sectionTitles: {
          ...prev.sectionTitles,
          food: prev.sectionTitles.food === 'Sho 3abalna nekol? 🍕' || !prev.sectionTitles.food ? 'Sho badna na3mel? 🎯' : prev.sectionTitles.food,
        },
        subtitles: {
          ...prev.subtitles,
          food: prev.subtitles.food === 'Food speaks louder than words. Pick your craving:' || !prev.subtitles.food ? 'Pick the activity you are most excited for:' : prev.subtitles.food,
        }
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.gsap-dash-header',
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
        );
        gsap.fromTo(
          '.gsap-dash-card',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.65, stagger: 0.1, ease: 'power3.out' }
        );
      });
      return () => ctx.revert();
    }
  }, [loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.customer.getDashboard();
      const firstInv = res.data?.invitations?.[0];
      if (!firstInv) {
        setFeedback({ type: 'error', message: 'No invitation found for this customer account.' });
        return;
      }

      const pId = firstInv.public_id || firstInv.publicId;
      const fullRes = await api.customer.getInvitation(pId);
      const invData = fullRes.data;

      const invObj = {
        ...(invData.invitation || {}),
        publicId: pId,
        slug: invData.invitation?.slug || firstInv.slug,
        status: invData.invitation?.status || firstInv.status,
        recipientName: invData.invitation?.recipient_name || firstInv.recipient_name || firstInv.recipientName,
        scheduleMode: invData.invitation?.schedule_mode || 'strict',
        isClaimed: Boolean(invData.invitation?.is_claimed || firstInv.is_claimed),
        claimedAt: invData.invitation?.claimed_at || firstInv.claimed_at,
        claimedPayload: invData.invitation?.claimed_payload || firstInv.claimed_payload,
      };
      setInvitation(invObj);

      if (invData.content) {
        let checklistArr = ['Clean kicks & cozy vibes', 'Fragrance on point', 'Your best smile (mandatory)'];
        if (invData.content.dress_code_checklist) {
          try {
            checklistArr = typeof invData.content.dress_code_checklist === 'string'
              ? JSON.parse(invData.content.dress_code_checklist)
              : invData.content.dress_code_checklist;
          } catch {
            // keep default
          }
        }

        setContent({
          openingText: invData.content.opening_text || '',
          questionText: invData.content.question_text || '',
          yesButtonText: invData.content.yes_button_text || 'YES ❤️',
          noButtonText: invData.content.no_button_text || 'NO',
          categoryType: invData.content.category_type || 'food',
          angry: {
            title: invData.content.angry_title || 'EXCUSE ME?! 😤',
            message: invData.content.angry_message || 'You have pressed NO THREE TIMES. I am starting to take this personally. 😭💔',
            button: invData.content.angry_button || 'Okay okay… ❤️'
          },
          sectionTitles: {
            locations: invData.content.location_title || 'Okay… since you said YES 😌❤️',
            food: invData.content.food_title || 'And what are we eating?',
            when: invData.content.when_title || 'When? ⏰',
            dressCode: invData.content.dress_code_title || 'What should you wear? 👕',
          },
          subtitles: {
            locations: invData.content.location_subtitle || 'Now we have some important decisions to make. Where are we heading?',
            food: invData.content.food_subtitle || 'Food speaks louder than words. Pick your craving:',
            when: invData.content.when_subtitle || "(Spoiler: There is no date picker, don't even look for one)",
            dressCode: invData.content.dress_code_subtitle || 'The official dress code instructions.',
          },
          final: {
            title: invData.content.final_title || "IT'S A DATE. ❤️",
            message: invData.content.final_message || 'Congratulations. You have successfully agreed to go on a date with me. 😂❤️',
          }
        });

        setDressConfig({
          value: invData.invitation?.dress_code || 'Casual',
          quote: invData.invitation?.dress_code_text || 'Nothing too serious. Just look cute.',
          checklist: Array.isArray(checklistArr) ? checklistArr : ['Clean kicks & cozy vibes', 'Fragrance on point', 'Your best smile (mandatory)'],
        });
      }

      if (invData.invitation) {
        setScheduleConfig({
          mode: invData.invitation.schedule_mode || 'strict',
          text: invData.invitation.date_text || 'Tomorrow',
          time: invData.invitation.time_value ? String(invData.invitation.time_value).slice(0, 5) : '6:00 PM',
          startTime: invData.content?.picker_start_time || '6:00 PM',
          endTime: invData.content?.picker_end_time || '11:00 PM',
        });
        if (invData.theme?.id) {
          setSelectedThemeId(Number(invData.theme.id));
        } else if (invData.invitation.theme_id) {
          setSelectedThemeId(Number(invData.invitation.theme_id));
        }
      }

      if (invData.content?.theme_accent_color || invData.content?.themeAccentColor) {
        setCustomAccentColor(invData.content.theme_accent_color || invData.content.themeAccentColor);
      }

      if (Array.isArray(invData.locations)) {
        setLocations(invData.locations.map(l => ({
          id: l.id,
          name: l.name,
          tag: l.tag || l.category || 'Vibe',
          description: l.description,
          imageUrl: l.imageUrl || l.image_url || '/gifs/loc_skymate.gif'
        })));
      }

      if (Array.isArray(invData.foodOptions)) {
        setOptions(invData.foodOptions.map(f => ({
          id: f.id,
          name: f.name,
          description: f.description,
          emoji: f.emoji || '🍴',
          imageUrl: f.imageUrl || f.image_url || '/gifs/food_lebanese.gif'
        })));
      }

      if (invData.media) {
        setMediaSlots(prev => ({
          ...prev,
          openingGif: invData.media.openingGif || invData.media.hero?.url || prev.openingGif,
          angryGif: invData.media.angryGif || invData.media.angry?.url || prev.angryGif,
          whenGif: invData.media.whenGif || invData.media.when?.url || prev.whenGif,
          dressGif: invData.media.dressGif || invData.media.dress?.url || prev.dressGif,
          finalGif: invData.media.finalGif || invData.media.final?.url || prev.finalGif,
        }));
      }

      if (pId) {
        try {
          const statsRes = await api.customer.getAnalytics(pId);
          if (statsRes.data) {
            setStats({
              views: statsRes.data.views || 0,
              yesClicks: statsRes.data.yesClicks || 0,
              noClicks: statsRes.data.noClicks || 0,
              rsvpShares: statsRes.data.rsvps || statsRes.data.shares || 0
            });
          }
        } catch {
          // Ignore
        }
      }

    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load invitation' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGifPicker = (targetType, targetIndex, targetField, title, currentUrl) => {
    setGifPicker({
      open: true,
      title,
      targetType,
      targetIndex,
      targetField,
      currentUrl: currentUrl || '',
    });
  };

  const handleGifSelected = (url) => {
    if (gifPicker.targetType === 'mediaSlot') {
      setMediaSlots(prev => ({ ...prev, [gifPicker.targetField]: url }));
    } else if (gifPicker.targetType === 'location') {
      setLocations(prev => prev.map((loc, idx) => idx === gifPicker.targetIndex ? { ...loc, imageUrl: url } : loc));
    } else if (gifPicker.targetType === 'option') {
      setOptions(prev => prev.map((opt, idx) => idx === gifPicker.targetIndex ? { ...opt, imageUrl: url } : opt));
    }
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    setDressConfig(prev => ({
      ...prev,
      checklist: [...prev.checklist, newChecklistItem.trim()]
    }));
    setNewChecklistItem('');
  };

  const handleRemoveChecklistItem = (idx) => {
    setDressConfig(prev => ({
      ...prev,
      checklist: prev.checklist.filter((_, i) => i !== idx)
    }));
  };

  const handleSave = async () => {
    if (!invitation?.publicId) return;
    if (invitation.isClaimed) {
      setFeedback({ type: 'error', message: 'This invitation has already been accepted and locked. No further edits are permitted.' });
      return;
    }
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      sound.playPop();
      await Promise.all([
        // 1. Update general content
        api.customer.updateContent(invitation.publicId, {
          opening_text: content.openingText,
          question_text: content.questionText,
          yes_button_text: content.yesButtonText,
          no_button_text: content.noButtonText,
          angry_title: content.angry.title,
          angry_message: content.angry.message,
          angry_button: content.angry.button,
          category_type: content.categoryType,
          location_title: content.sectionTitles.locations,
          location_subtitle: content.subtitles.locations,
          food_title: content.sectionTitles.food,
          food_subtitle: content.subtitles.food,
          when_title: content.sectionTitles.when,
          when_subtitle: content.subtitles.when,
          dress_code_title: content.sectionTitles.dressCode,
          dress_code_subtitle: content.subtitles.dressCode,
          dress_code_checklist: dressConfig.checklist,
          opening_gif: mediaSlots.openingGif,
          angry_gif: mediaSlots.angryGif,
          when_gif: mediaSlots.whenGif,
          dress_gif: mediaSlots.dressGif,
          final_gif: mediaSlots.finalGif,
          final_title: content.final.title,
          final_message: content.final.message,
          theme_accent_color: customAccentColor || null,
          picker_start_time: scheduleConfig.startTime || '6:00 PM',
          picker_end_time: scheduleConfig.endTime || '11:00 PM',
        }),

        // 2. Update invitation schedule & dress code & theme
        api.customer.updateInvitation(invitation.publicId, {
          scheduleMode: scheduleConfig.mode,
          dateText: scheduleConfig.text,
          timeValue: scheduleConfig.time,
          dressCode: dressConfig.value,
          dressCodeText: dressConfig.quote,
          recipientName: invitation.recipientName,
          themeId: selectedThemeId,
        }),

        // 3. Update custom locations (Step 1)
        api.customer.updateCustomLocations(invitation.publicId, locations),

        // 4. Update custom options (Step 2)
        api.customer.updateCustomOptions(invitation.publicId, options),
      ]);

      setFeedback({ type: 'success', message: 'Kel l ta3dilat n7afzo bi naja7! ✨ All changes saved successfully!' });
      sound.playCelebration();
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!invitation?.publicId) return;
    setPublishing(true);
    setFeedback({ type: '', message: '' });

    try {
      if (invitation.status === 'published') {
        await api.customer.unpublish(invitation.publicId);
        setInvitation(prev => ({ ...prev, status: 'draft' }));
        setFeedback({ type: 'success', message: 'Rajja3na l da3weh draft. Invitation unpublished.' });
      } else {
        const res = await api.customer.publish(invitation.publicId);
        setInvitation(prev => ({ ...prev, status: 'published', slug: res.data?.slug || prev.slug }));
        setFeedback({ type: 'success', message: 'L da3weh sarit shaghaleh online! 🥂 Invitation is now live!' });
        sound.playCelebration();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update publication status' });
    } finally {
      setPublishing(false);
    }
  };

  const copyPublicUrl = () => {
    if (!invitation?.slug) return;
    const url = `${window.location.origin}/d/${invitation.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffafa] flex items-center justify-center p-4">
        <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-rose-200/90 p-8 shadow-[0_20px_50px_rgba(185,0,64,0.08)] text-center max-w-sm w-full flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-primary flex items-center justify-center mb-3 animate-pulse border border-rose-200">
            <Sparkles size={24} />
          </div>
          <h3 className="font-title-editorial text-xl font-bold text-on-surface">Yalla Yes Suite</h3>
          <p className="text-sm text-on-surface-variant mt-1">3am n7addir law7et l ta7akkoum taba3ak...</p>
        </div>
      </div>
    );
  }

  const publicUrl = invitation?.slug ? `${window.location.origin}/d/${invitation.slug}` : '';

  return (
    <div className="bg-[#fffafa] font-body-md text-on-surface relative min-h-screen selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden pb-24">
      {/* Ambient Blurred Background Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] rounded-full bg-rose-200/35 blur-[130px]"></div>
        <div className="absolute top-1/3 -right-20 w-[550px] h-[550px] rounded-full bg-amber-100/40 blur-[140px]"></div>
        <div className="absolute -bottom-24 left-1/3 w-[600px] h-[600px] rounded-full bg-pink-200/30 blur-[150px]"></div>
      </div>

      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-rose-100/70 shadow-[0_4px_30px_rgba(185,0,64,0.03)] gsap-dash-header">
        <div className="h-20 max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-rose-400 text-white flex items-center justify-center shadow-[0_4px_12px_rgba(227,23,84,0.3)] group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-editorial text-[20px] font-bold text-on-surface tracking-tight leading-none">
                Yalla Yes • Law7et L Ta7akkoum
              </span>
              <span className="font-label-sm text-[10px] text-primary font-bold tracking-widest uppercase mt-0.5">
                Bespoke Proposal Studio 🇱🇧
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 text-on-surface-variant hover:text-primary hover:bg-rose-100 font-label-md text-xs font-semibold border border-rose-200/70 transition-all"
            >
              <Globe size={13} />
              <span>L Raisiyeh • Landing</span>
            </Link>

            {invitation?.publicId && (
              <Link
                to={`/preview/${invitation.publicId}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-rose-200 text-on-surface hover:text-primary hover:border-primary font-label-md text-xs font-semibold shadow-sm transition-all"
              >
                <Eye size={14} className="text-primary" />
                <span>Ma3ayaneh • Preview</span>
              </Link>
            )}

            <button
              onClick={() => logout().then(() => navigate('/login'))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 font-label-md text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Khourouj • Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 pt-28">
        {/* Feedback Alert Toast */}
        {feedback.message && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 shadow-sm border animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {feedback.type === 'success' ? (
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-600 shrink-0" />
            )}
            <span className="text-sm font-semibold">{feedback.message}</span>
          </div>
        )}

        {/* Status & Live Link Card */}
        <div className="relative group mb-8 gsap-dash-card">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-400/20 via-primary/20 to-amber-300/20 rounded-3xl blur-xl opacity-75"></div>

          <div className="relative rounded-3xl bg-white/95 backdrop-blur-2xl border border-rose-200/90 p-6 sm:p-8 shadow-[0_20px_50px_rgba(185,0,64,0.08)]">
            {invitation?.isClaimed && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 flex items-start sm:items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                    <span>💍 Nfadet l khesseh w n2aflet rasmiyan!</span>
                  </div>
                  <p className="text-xs text-amber-800/90 mt-0.5">
                    Wefe2et {invitation?.recipientName} 3al da3weh w tsabbato l choices ke-zekra romance ma btet3addal ba2a.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h1 className="font-title-editorial text-2xl sm:text-3xl font-bold text-on-surface">
                    Da3wet {invitation?.recipientName} L Khasah ❤️
                  </h1>
                  {invitation?.isClaimed ? (
                    <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
                      💍 Claimed & Sealed
                    </span>
                  ) : (
                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold border shadow-sm ${
                      invitation?.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {invitation?.status === 'published' ? '🟢 Live Onliné (Manshoura)' : '📝 Draft (Gheir Manshoura)'}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  {invitation?.isClaimed
                    ? 'Tamm tawsiq l ettafaq bi naja7! L link sar wasiqa gharamiyeh de2imeh.'
                    : invitation?.status === 'published'
                    ? 'Da3wtak manshoura w shaghaleh! Ayya 7ada ma3o l link fiyo yshoufa w yetfe3al ma3a.'
                    : 'L da3weh bil draft hal2. 3addil l nousous wl choices, jarreb l preview, w nshora bass tejhaz!'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handlePublishToggle}
                  disabled={publishing || invitation?.isClaimed}
                  className={`px-5 py-2.5 rounded-full font-label-md text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md ${
                    invitation?.isClaimed
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      : invitation?.status === 'published'
                      ? 'bg-white border border-rose-200 text-on-surface hover:border-red-300 hover:text-red-600'
                      : 'bg-gradient-to-r from-primary to-rose-600 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {invitation?.isClaimed
                    ? 'Makhtoumeh 💍'
                    : publishing
                    ? '3am n7addes...'
                    : invitation?.status === 'published'
                    ? 'Unpublish • Rajje3a Draft'
                    : 'Onchor L Da3weh Live ❤️'}
                </button>
              </div>
            </div>

            {/* Public Link Box */}
            {invitation?.status === 'published' && (
              <div className="mt-6 p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white border border-rose-200 text-primary flex items-center justify-center shrink-0 shadow-xs">
                    <Globe size={16} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-primary truncate dir-ltr">
                    {publicUrl}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={copyPublicUrl}
                    className="px-3.5 py-1.5 rounded-full bg-white border border-rose-200 text-on-surface hover:text-primary font-label-md text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copied ? 'Tamm L Naskh! Copied' : 'Nssakh L Link • Copy'}</span>
                  </button>

                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-primary text-white hover:bg-primary-container font-label-md text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    <span>Fta7 • Open</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Bento Grid (4 Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 gsap-dash-card">
          <div className="p-5 rounded-3xl bg-white/90 border border-rose-100/90 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-xs font-bold">Total Views • Meshehadat</span>
              <Eye size={16} className="text-rose-500" />
            </div>
            <div className="font-display-lg text-2xl sm:text-3xl font-bold text-on-surface">{stats.views}</div>
            <span className="text-[11px] text-on-surface-variant">Views & opens</span>
          </div>

          <div className="p-5 rounded-3xl bg-white/90 border border-rose-100/90 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-xs font-bold">Kabsat Yes ❤️</span>
              <Heart size={16} className="text-emerald-600" />
            </div>
            <div className="font-display-lg text-2xl sm:text-3xl font-bold text-emerald-600">{stats.yesClicks}</div>
            <span className="text-[11px] text-on-surface-variant">Accepted proposals</span>
          </div>

          <div className="p-5 rounded-3xl bg-white/90 border border-rose-100/90 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-xs font-bold">Zowghan No 💨</span>
              <Zap size={16} className="text-primary" />
            </div>
            <div className="font-display-lg text-2xl sm:text-3xl font-bold text-primary">{stats.noClicks}</div>
            <span className="text-[11px] text-on-surface-variant">Runaway dodges</span>
          </div>

          <div className="p-5 rounded-3xl bg-white/90 border border-rose-100/90 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between text-on-surface-variant mb-2">
              <span className="text-xs font-bold">Tazaker WhatsApp 💬</span>
              <MessageSquare size={16} className="text-amber-500" />
            </div>
            <div className="font-display-lg text-2xl sm:text-3xl font-bold text-amber-600">{stats.rsvpShares}</div>
            <span className="text-[11px] text-on-surface-variant">Confirmed RSVPs</span>
          </div>
        </div>

        {/* Claimed Proposal Official RSVP Receipt */}
        {invitation?.isClaimed && (
          <div className="mb-8 rounded-3xl bg-gradient-to-br from-amber-50/90 via-white to-rose-50/60 border border-amber-300/80 p-6 sm:p-7 shadow-[0_16px_40px_rgba(217,119,6,0.1)] relative overflow-hidden gsap-dash-card">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-amber-200/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-title-editorial text-lg font-bold text-on-surface">
                    Official Date Itinerary Confirmed! 🥂
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Wefe2et {invitation?.recipientName} w hayde l khesseh l rasmiyeh l makhtoumeh
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shadow-xs">
                Sealed & Confirmed 💍
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white/90 border border-amber-200/70 shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">📅 L Maw3ed wl Wa2et</span>
                <span className="text-sm font-bold text-on-surface">{scheduleConfig.text}</span>
                <span className="text-xs text-on-surface-variant">{scheduleConfig.time}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-amber-200/70 shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">📍 L Matra7 L Mokhtar</span>
                <span className="text-sm font-bold text-on-surface">
                  {locations[0]?.name || 'Sunset Promenade'}
                </span>
                <span className="text-xs text-on-surface-variant">{locations[0]?.tag || 'Romantic Vibe'}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-amber-200/70 shadow-xs flex flex-col gap-1">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">🍕 L Akel wl Cravings</span>
                <span className="text-sm font-bold text-on-surface">
                  {options[0]?.name || 'Street Pizza Crawl'}
                </span>
                <span className="text-xs text-on-surface-variant">{dressConfig.value} Dress Code</span>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none gsap-dash-card">
          {[
            { id: 'proposal', label: '1. Proposal • L Sou2al wl Ma2lab', icon: Heart },
            { id: 'venues', label: '2. Venues • L Meshwar wl Matra7', icon: MapPin },
            { id: 'options', label: '3. Dining • L Akel wl Vibe', icon: Compass },
            { id: 'schedule', label: '4. Schedule • L Wa2et wl Tarikh', icon: Calendar },
            { id: 'dress', label: '5. Dress Code • L Lebes wl Mazhar', icon: Shirt },
            { id: 'final', label: '6. Finale • L Khetam wl Fara7', icon: Sparkles },
            { id: 'theme', label: '7. Colors & Theme • L Alwan wl Style', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-full font-label-md text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-rose-600 text-white shadow-rose-500/25 scale-[1.02]'
                    : 'bg-white/90 border border-rose-200/80 text-on-surface-variant hover:text-primary hover:bg-rose-50'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Proposal Screen Editor */}
        {activeTab === 'proposal' && (
          <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-rose-200/90 p-6 sm:p-8 shadow-[0_20px_50px_rgba(185,0,64,0.08)] mb-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-rose-100">
              <div>
                <h3 className="font-title-editorial text-xl font-bold text-on-surface">
                  Screen 1: Proposal Copy & Interactive Runaway Mechanics
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Ta3dil sou2al l proposal, kabsat l Yes wl No l harebeh, w risalet l ghadab (Strike 3)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-primary text-xs font-bold">
                💍 Mar7aleh 1 • L Bidayeh
              </span>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Opening Lead Text • L Joumleh L Tamhidiyeh
                </label>
                <input
                  type="text"
                  value={content.openingText}
                  onChange={(e) => setContent(prev => ({ ...prev, openingText: e.target.value }))}
                  placeholder="3ande elik sou2al ktir ktir masiri... 🥺 (I have a very important question for you…)"
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  The Big Proposal Question • L Sou2al L Asasi
                </label>
                <input
                  type="text"
                  value={content.questionText}
                  onChange={(e) => setContent(prev => ({ ...prev, questionText: e.target.value }))}
                  placeholder="Btetla3i ma3e date hal weekend? ❤️ (Will you go on a date with me?)"
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">
                    YES Button Text • Kabsat L Qaboul
                  </label>
                  <input
                    type="text"
                    value={content.yesButtonText}
                    onChange={(e) => setContent(prev => ({ ...prev, yesButtonText: e.target.value }))}
                    placeholder="YALLA YES ❤️"
                    className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1.5">
                    NO Button Text • Kabsat L Rafed L Harebeh
                  </label>
                  <input
                    type="text"
                    value={content.noButtonText}
                    onChange={(e) => setContent(prev => ({ ...prev, noButtonText: e.target.value }))}
                    placeholder="La2 (jarrib kbos)"
                    className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Visual Media Slots for Screen 1 */}
            <div className="p-5 rounded-2xl bg-white border border-rose-200/80 mb-6 shadow-xs">
              <div className="flex items-center gap-2 mb-3.5 text-primary font-bold text-sm">
                <ImageIcon size={18} />
                <span>Screen 1 Media Slots • GIFs L Proposal & L Za3al</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opening Lead GIF */}
                <div className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/70 flex items-center gap-3">
                  <img
                    src={mediaSlots.openingGif}
                    alt="Opening Lead GIF"
                    className="w-16 h-16 object-cover rounded-xl border border-rose-200 shadow-xs shrink-0"
                  />
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-bold text-on-surface truncate">Opening Lead GIF</span>
                    <span className="text-[11px] text-on-surface-variant truncate">Souret l raja2 l awwal 🥺</span>
                    <button
                      type="button"
                      onClick={() => handleOpenGifPicker('mediaSlot', null, 'openingGif', 'Na22i GIF L Bidayeh', mediaSlots.openingGif)}
                      className="text-[11px] font-bold text-primary hover:text-rose-700 flex items-center gap-1 cursor-pointer w-fit mt-0.5"
                    >
                      <ImageIcon size={12} />
                      <span>Ghayyir L GIF • Change</span>
                    </button>
                  </div>
                </div>

                {/* Angry Strike 3 GIF */}
                <div className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/70 flex items-center gap-3">
                  <img
                    src={mediaSlots.angryGif}
                    alt="Angry Strike 3 GIF"
                    className="w-16 h-16 object-cover rounded-xl border border-rose-200 shadow-xs shrink-0"
                  />
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-bold text-on-surface truncate">Angry Strike 3 GIF</span>
                    <span className="text-[11px] text-on-surface-variant truncate">GIF l bsayneh l m3asbeh 😾</span>
                    <button
                      type="button"
                      onClick={() => handleOpenGifPicker('mediaSlot', null, 'angryGif', 'Na22i GIF Strike 3 Cat', mediaSlots.angryGif)}
                      className="text-[11px] font-bold text-primary hover:text-rose-700 flex items-center gap-1 cursor-pointer w-fit mt-0.5"
                    >
                      <ImageIcon size={12} />
                      <span>Ghayyir L GIF • Change</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Strike 3 Cat Modal Settings */}
            <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/70">
              <div className="flex items-center gap-2 mb-3 text-primary font-bold text-sm">
                <span className="material-symbols-outlined text-[18px]">sentiment_very_dissatisfied</span>
                <span>Strike 3 Intervention Modal • Nafizet L Tanbih Bass Tekbos La2 3 Marrat</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Angry Title • 3enwan L Za3al
                  </label>
                  <input
                    type="text"
                    value={content.angry.title}
                    onChange={(e) => setContent(prev => ({ ...prev, angry: { ...prev.angry, title: e.target.value } }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-on-surface text-sm outline-none focus:border-primary shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                    Surrender Button • Kabsat L Estislam
                  </label>
                  <input
                    type="text"
                    value={content.angry.button}
                    onChange={(e) => setContent(prev => ({ ...prev, angry: { ...prev.angry, button: e.target.value } }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-on-surface text-sm outline-none focus:border-primary shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Angry Message • Risalet L 3itab
                </label>
                <textarea
                  rows={2}
                  value={content.angry.message}
                  onChange={(e) => setContent(prev => ({ ...prev, angry: { ...prev.angry, message: e.target.value } }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-on-surface text-sm outline-none focus:border-primary shadow-xs resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Venues / Outings Editor */}
        {activeTab === 'venues' && (
          <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-rose-200/90 p-6 sm:p-8 shadow-[0_20px_50px_rgba(185,0,64,0.08)] mb-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-rose-100">
              <div>
                <h3 className="font-title-editorial text-xl font-bold text-on-surface">
                  Screen 2: Outings & Location Choices • Khiyarat L Meshwar
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Khod ra7tak bi ta3dil l 3anawin wl krouteh l tleteh li baddak l taraf l teneh yna22i menna
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-primary text-xs font-bold">
                🏙️ Mar7aleh 2 • L Matra7
              </span>
            </div>

            {/* Quick Inspiration Chips & Custom Activity Hub */}
            <div className="mb-6 p-4.5 rounded-2xl bg-rose-50/40 border border-rose-200/70 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="block text-xs font-bold text-on-surface">
                  Afkar Lebneniyeh Sari3a • Quick Lebanese Venue Presets (Kbosi la t3abbi):
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenActivityPicker('location', 0, `Card #1 (${locations[0]?.name || 'Slot 1'})`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-rose-600 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer w-fit"
                >
                  <Compass size={13} />
                  <span>🎯 Ekhtar Nashat Khass • Choose Custom Activity</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {VENUE_PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleApplyVenuePreset(preset, pIdx % locations.length)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 hover:border-primary hover:bg-rose-50 text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>{preset.tag}</span>
                    <span className="font-bold text-primary">{preset.name}</span>
                  </button>
                ))}
              </div>

              {/* Quick Activity Presets for Screen 2 */}
              <div className="pt-2.5 border-t border-rose-100">
                <span className="block text-[11px] font-bold text-on-surface-variant mb-2">
                  🎯 Afkar Anshita Tafa3oliyeh • Interactive Date Activities (Kbosi la t3abbi):
                </span>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_PRESETS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleApplyActivityPresetToLocation(preset, pIdx % locations.length)}
                      className="px-2.5 py-1 rounded-xl bg-white/90 border border-rose-200 hover:border-primary hover:bg-rose-50 text-[11px] font-semibold text-on-surface flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <span>{preset.emoji}</span>
                      <span className="font-bold text-rose-700">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Section Heading • 3enwan L Mar7aleh
                </label>
                <input
                  type="text"
                  value={content.sectionTitles.locations}
                  onChange={(e) => setContent(prev => ({ ...prev, sectionTitles: { ...prev.sectionTitles, locations: e.target.value } }))}
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Section Subtitle • L Shar7 L Tawdi7i
                </label>
                <input
                  type="text"
                  value={content.subtitles.locations}
                  onChange={(e) => setContent(prev => ({ ...prev, subtitles: { ...prev.subtitles, locations: e.target.value } }))}
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {locations.map((loc, idx) => (
                <div
                  key={loc.id || idx}
                  className="p-4 sm:p-5 rounded-2xl bg-rose-50/35 border border-rose-200/80 flex flex-col sm:flex-row items-center gap-4 shadow-sm"
                >
                  <div className="flex flex-col items-center shrink-0 w-28">
                    <img
                      src={loc.imageUrl}
                      alt={loc.name}
                      className="w-20 h-20 object-cover rounded-xl border border-rose-200 shadow-sm"
                    />
                    <div className="flex flex-col gap-1 w-full mt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenActivityPicker('location', idx, `Card #${idx + 1} (${loc.name || 'Venue'})`)}
                        className="w-full py-1 px-2 rounded-lg bg-rose-50 border border-rose-200 hover:border-primary hover:bg-rose-100 text-[11px] font-bold text-primary flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="Ekhtar nashat curated aw 3abbi custom activity"
                      >
                        <Compass size={12} />
                        <span>🎯 Nashat Khass</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenGifPicker('location', idx, 'imageUrl', `Select GIF for ${loc.name}`, loc.imageUrl)}
                        className="w-full py-0.5 text-[10px] font-semibold text-on-surface-variant hover:text-primary flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <ImageIcon size={11} />
                        <span>Ghayyir L GIF</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                        Esem L Matra7 • Venue Name #{idx + 1}
                      </label>
                      <input
                        type="text"
                        value={loc.name}
                        onChange={(e) => setLocations(prev => prev.map((l, i) => i === idx ? { ...l, name: e.target.value } : l))}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-sm font-semibold text-on-surface outline-none focus:border-primary shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                        L Tag • Vibe Category
                      </label>
                      <input
                        type="text"
                        value={loc.tag}
                        onChange={(e) => setLocations(prev => prev.map((l, i) => i === idx ? { ...l, tag: e.target.value } : l))}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-sm text-on-surface outline-none focus:border-primary shadow-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                        L Shar7 • Description
                      </label>
                      <input
                        type="text"
                        value={loc.description}
                        onChange={(e) => setLocations(prev => prev.map((l, i) => i === idx ? { ...l, description: e.target.value } : l))}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-sm text-on-surface outline-none focus:border-primary shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Activities & Dining Editor */}
        {activeTab === 'options' && (
          <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-rose-200/90 p-6 sm:p-8 shadow-[0_20px_50px_rgba(185,0,64,0.08)] mb-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-rose-100">
              <div>
                <h3 className="font-title-editorial text-xl font-bold text-on-surface">
                  Screen 3: Activities & Dining • L Akel wl Mashehad wl Anshita
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Na22i theme l khesseh (Akel w matayem, Anshita w de7ek, Cocktail w sahra, aw experience khassa)
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-primary text-xs font-bold">
                🍕 Mar7aleh 3 • L Akel
              </span>
            </div>

            {/* Category Mode Selector */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-on-surface mb-2">
                Category Theme • No3 L Shasheh:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'food', label: '🍴 Akel w Matayem', title: 'Sho 3abalna nekol? 🍕', sub: 'Food speaks louder than words. Pick your craving:' },
                  { id: 'activity', label: '🎯 Anshita w De7ek', title: 'Sho badna na3mel? 🎯', sub: 'Pick the activity you are most excited for:' },
                  { id: 'drinks', label: '🍸 Cocktail w Sahra', title: 'Sho badna neshrab? 🍸', sub: 'Pick our evening refreshment:' },
                  { id: 'custom', label: '✨ Tajrobeh Khassah', title: 'Sho bna3mel hal2? ✨', sub: 'Make your choice:' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setContent(prev => ({
                        ...prev,
                        categoryType: cat.id,
                        sectionTitles: { ...prev.sectionTitles, food: prev.sectionTitles.food || cat.title },
                        subtitles: { ...prev.subtitles, food: prev.subtitles.food || cat.sub },
                      }));
                    }}
                    className={`p-3 rounded-2xl text-xs font-bold transition-all text-center cursor-pointer ${
                      content.categoryType === cat.id
                        ? 'bg-rose-50 border-2 border-primary text-primary shadow-xs'
                        : 'bg-white border border-rose-200 text-on-surface-variant hover:border-rose-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Inspiration Chips & Custom Activity Hub */}
            <div className="mb-6 p-4.5 rounded-2xl bg-rose-50/40 border border-rose-200/70 flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="block text-xs font-bold text-on-surface">
                  Afkar Akel Sari3a • Quick Dining Presets (Kbosi la t3abbi):
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenActivityPicker('option', 0, `Card #${1} (${options[0]?.name || 'Option 1'})`)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-primary to-rose-600 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer w-fit"
                >
                  <Compass size={13} />
                  <span>🎯 Ekhtar Nashat Khass • Choose Custom Activity</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {OPTION_PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleApplyOptionPreset(preset, pIdx % options.length)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 hover:border-primary hover:bg-rose-50 text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <span>{preset.emoji}</span>
                    <span className="font-bold text-primary">{preset.name}</span>
                  </button>
                ))}
              </div>

              {/* Quick Activity Presets for Screen 3 */}
              <div className="pt-2.5 border-t border-rose-100">
                <span className="block text-[11px] font-bold text-on-surface-variant mb-2">
                  🎯 Afkar Anshita Tafa3oliyeh • Interactive Date Activities (Kbosi la t3abbi):
                </span>
                <div className="flex flex-wrap gap-2">
                  {ACTIVITY_PRESETS.map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleApplyActivityPresetToOption(preset, pIdx % options.length)}
                      className="px-2.5 py-1 rounded-xl bg-white/90 border border-rose-200 hover:border-primary hover:bg-rose-50 text-[11px] font-semibold text-on-surface flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                    >
                      <span>{preset.emoji}</span>
                      <span className="font-bold text-rose-700">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Section Heading • 3enwan L Mar7aleh
                </label>
                <input
                  type="text"
                  value={content.sectionTitles.food}
                  onChange={(e) => setContent(prev => ({ ...prev, sectionTitles: { ...prev.sectionTitles, food: e.target.value } }))}
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Section Subtitle • L Shar7 L Tawdi7i
                </label>
                <input
                  type="text"
                  value={content.subtitles.food}
                  onChange={(e) => setContent(prev => ({ ...prev, subtitles: { ...prev.subtitles, food: e.target.value } }))}
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {options.map((opt, idx) => (
                <div
                  key={opt.id || idx}
                  className="p-4 sm:p-5 rounded-2xl bg-rose-50/35 border border-rose-200/80 flex flex-col sm:flex-row items-center gap-4 shadow-sm"
                >
                  <div className="flex flex-col items-center shrink-0 w-28">
                    <img
                      src={opt.imageUrl}
                      alt={opt.name}
                      className="w-20 h-20 object-cover rounded-xl border border-rose-200 shadow-sm"
                    />
                    <div className="flex flex-col gap-1 w-full mt-2">
                      <button
                        type="button"
                        onClick={() => handleOpenActivityPicker('option', idx, `Card #${idx + 1} (${opt.name || 'Option'})`)}
                        className="w-full py-1 px-2 rounded-lg bg-rose-50 border border-rose-200 hover:border-primary hover:bg-rose-100 text-[11px] font-bold text-primary flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        title="Ekhtar nashat curated aw 3abbi custom activity"
                      >
                        <Compass size={12} />
                        <span>🎯 Nashat Khass</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenGifPicker('option', idx, 'imageUrl', `Select GIF for ${opt.name}`, opt.imageUrl)}
                        className="w-full py-0.5 text-[10px] font-semibold text-on-surface-variant hover:text-primary flex items-center justify-center gap-1 cursor-pointer transition-colors"
                      >
                        <ImageIcon size={11} />
                        <span>Ghayyir L GIF</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                        Esem L Khiyar • Option Name #{idx + 1}
                      </label>
                      <input
                        type="text"
                        value={opt.name}
                        onChange={(e) => setOptions(prev => prev.map((o, i) => i === idx ? { ...o, name: e.target.value } : o))}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-sm font-semibold text-on-surface outline-none focus:border-primary shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                        L Emoji • Icon
                      </label>
                      <input
                        type="text"
                        value={opt.emoji}
                        onChange={(e) => setOptions(prev => prev.map((o, i) => i === idx ? { ...o, emoji: e.target.value } : o))}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-sm text-center text-on-surface outline-none focus:border-primary shadow-xs"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                        L Shar7 • Description
                      </label>
                      <input
                        type="text"
                        value={opt.description}
                        onChange={(e) => setOptions(prev => prev.map((o, i) => i === idx ? { ...o, description: e.target.value } : o))}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-sm text-on-surface outline-none focus:border-primary shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Date & Schedule Editor */}
        {activeTab === 'schedule' && (
          <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-rose-200/90 p-6 sm:p-8 shadow-[0_20px_50px_rgba(185,0,64,0.08)] mb-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-rose-100">
              <div>
                <h3 className="font-title-editorial text-xl font-bold text-on-surface">
                  Screen 4: Date & Scheduling Experience • Ta7did L Maw3ed
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Na22i bayn maw3ed ma2foul mosbaqan (ma2lab mahdoum) aw teftah l majal la tkhtar l yom 3al rawayeq
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-primary text-xs font-bold">
                ⏰ Mar7aleh 4 • L Maw3ed
              </span>
            </div>

            {/* Schedule Mode Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => setScheduleConfig(prev => ({ ...prev, mode: 'strict' }))}
                className={`p-5 rounded-2xl text-left transition-all cursor-pointer ${
                  scheduleConfig.mode === 'strict'
                    ? 'bg-rose-50 border-2 border-primary shadow-sm'
                    : 'bg-white border border-rose-200 hover:border-rose-300'
                }`}
              >
                <div className="font-bold text-sm text-on-surface flex items-center gap-2 mb-1">
                  <span>🔒 Maw3ed Ma2foul Mosbaqan (Ma2lab Mahdoum)</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  L maw3ed ma2foul ma fiyo yerja3 wara. Kabsat te2jil l maw3ed btethawwal la &quot;Mamnou3 L Te2jil ya helou 💅&quot;.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScheduleConfig(prev => ({ ...prev, mode: 'picker' }))}
                className={`p-5 rounded-2xl text-left transition-all cursor-pointer ${
                  scheduleConfig.mode === 'picker'
                    ? 'bg-rose-50 border-2 border-primary shadow-sm'
                    : 'bg-white border border-rose-200 hover:border-rose-300'
                }`}
              >
                <div className="font-bold text-sm text-on-surface flex items-center gap-2 mb-1">
                  <span>📅 Calendar Tafa3oli La Tkhtar L Yom</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Bte2dar l sha5siye l teniyeh tna22i l yom wl wa2et li beraye7a men interactive calendar aneeq.
                </p>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  {scheduleConfig.mode === 'strict' ? 'Nass L Maw3ed (e.g. Bokra L Jom3a / This Friday)' : 'L Yom L Moqtara7 • Default Suggested Day'}
                </label>
                <input
                  type="text"
                  value={scheduleConfig.text}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, text: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  {scheduleConfig.mode === 'strict' ? 'L Wa2et L Moqtara7 • Locked Time (e.g. 7:30 PM)' : 'L Wa2et L Mabda2i • Default Pre-selected Time'}
                </label>
                <input
                  type="text"
                  value={scheduleConfig.time}
                  onChange={(e) => setScheduleConfig(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Configurable Hours Window for Picker Mode */}
            {scheduleConfig.mode === 'picker' && (
              <div className="mb-6 p-5 rounded-2xl bg-rose-50/50 border border-rose-200/90 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="block text-xs font-bold text-on-surface">
                      ⏰ Majal Sa3at L Maw3ed • Date Hours Window (Start & End Time)
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      7added awwal se3a w e5ir se3a bte2dar l sha5siye l teniyeh tna22i bayneton
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-rose-100 text-primary text-[11px] font-bold w-fit">
                    {scheduleConfig.startTime || '6:00 PM'} ➔ {scheduleConfig.endTime || '11:00 PM'}
                  </span>
                </div>

                {/* Quick Window Presets */}
                <div>
                  <span className="block text-[11px] font-bold text-on-surface-variant mb-2">
                    Quick Lebanese Hour Presets (Kbosi la t3abbi):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: '☀️ Ba3d L Doher • Afternoon', start: '1:00 PM', end: '5:00 PM' },
                      { label: '🌅 Ghroub Batroun • Sunset', start: '5:00 PM', end: '8:30 PM' },
                      { label: '🌙 3asha w Sahra • Evening', start: '7:00 PM', end: '11:30 PM' },
                      { label: '🍸 Sahra Layliye • Late Night', start: '9:00 PM', end: '2:00 AM' },
                    ].map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => {
                          setScheduleConfig(prev => ({ ...prev, startTime: preset.start, endTime: preset.end }));
                          sound.playPop();
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                          scheduleConfig.startTime === preset.start && scheduleConfig.endTime === preset.end
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white border-rose-200 text-on-surface hover:border-primary hover:bg-rose-50'
                        }`}
                      >
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start and End Hour Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                      Se3at L Bidayeh • Start Time (Earliest Hour)
                    </label>
                    <input
                      type="text"
                      value={scheduleConfig.startTime || '6:00 PM'}
                      onChange={(e) => setScheduleConfig(prev => ({ ...prev, startTime: e.target.value }))}
                      placeholder="e.g. 5:00 PM or 17:00"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-on-surface outline-none focus:border-primary shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-on-surface-variant mb-1">
                      Se3at L Nehyeh • End Time (Latest Hour)
                    </label>
                    <input
                      type="text"
                      value={scheduleConfig.endTime || '11:00 PM'}
                      onChange={(e) => setScheduleConfig(prev => ({ ...prev, endTime: e.target.value }))}
                      placeholder="e.g. 11:00 PM or 23:00"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-xs font-bold text-on-surface outline-none focus:border-primary shadow-xs"
                    />
                  </div>
                </div>

                {/* Live Preview of Generated Recipient Hour Slots */}
                <div className="pt-2 border-t border-rose-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-on-surface-variant">
                      Krouteh L Se3at Li Ra7 Yshoufa L Taraf L Teneh (Live Preview):
                    </span>
                    <span className="text-[10px] text-primary font-bold">
                      {generateHoursRange(scheduleConfig.startTime, scheduleConfig.endTime, 30).length} Slots (Every 30m)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                    {generateHoursRange(scheduleConfig.startTime, scheduleConfig.endTime, 30).map((slot, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-1 rounded-full bg-white border border-rose-200 text-[11px] font-semibold text-on-surface shadow-2xs"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Visual Media Slot for Schedule */}
            <div className="p-4 rounded-2xl bg-white border border-rose-200/80 mb-6 shadow-xs flex items-center gap-4">
              <img
                src={mediaSlots.whenGif}
                alt="Schedule GIF"
                className="w-16 h-16 object-cover rounded-xl border border-rose-200 shadow-xs shrink-0"
              />
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-bold text-on-surface">Schedule & Time GIF</span>
                <span className="text-[11px] text-on-surface-variant">Souret l se3a aw l calendar li btezyan bi hal shasheh</span>
                <button
                  type="button"
                  onClick={() => handleOpenGifPicker('mediaSlot', null, 'whenGif', 'Na22i GIF L Maw3ed', mediaSlots.whenGif)}
                  className="text-[11px] font-bold text-primary hover:text-rose-700 flex items-center gap-1 cursor-pointer w-fit mt-0.5"
                >
                  <ImageIcon size={12} />
                  <span>Ghayyir L GIF • Change</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Section Heading • 3enwan L Mar7aleh
                </label>
                <input
                  type="text"
                  value={content.sectionTitles.when}
                  onChange={(e) => setContent(prev => ({ ...prev, sectionTitles: { ...prev.sectionTitles, when: e.target.value } }))}
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Section Subtitle • L Shar7 L Tawdi7i
                </label>
                <input
                  type="text"
                  value={content.subtitles.when}
                  onChange={(e) => setContent(prev => ({ ...prev, subtitles: { ...prev.subtitles, when: e.target.value } }))}
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Dress Code Editor */}
        {activeTab === 'dress' && (
          <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-rose-200/90 p-6 sm:p-8 shadow-[0_20px_50px_rgba(185,0,64,0.08)] mb-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-rose-100">
              <div>
                <h3 className="font-title-editorial text-xl font-bold text-on-surface">
                  Screen 5: Dress Code & Vibe Check • Shourout L Lebes wl Mazhar
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  7added l style l matloub lal meshwar w shourout l mazhar l mahdoumeh
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-primary text-xs font-bold">
                ✨ Mar7aleh 5 • L Lebes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Style L Lebes (e.g. Casual Chic / Fancy / Cozy Hoodie)
                </label>
                <input
                  type="text"
                  value={dressConfig.value}
                  onChange={(e) => setDressConfig(prev => ({ ...prev, value: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  L 3ibara L Latifeh (e.g. Bas kouni cute 😌)
                </label>
                <input
                  type="text"
                  value={dressConfig.quote}
                  onChange={(e) => setDressConfig(prev => ({ ...prev, quote: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Visual Media Slot for Dress Code */}
            <div className="p-4 rounded-2xl bg-white border border-rose-200/80 mb-6 shadow-xs flex items-center gap-4">
              <img
                src={mediaSlots.dressGif}
                alt="Dress Code GIF"
                className="w-16 h-16 object-cover rounded-xl border border-rose-200 shadow-xs shrink-0"
              />
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-bold text-on-surface">Dress Code GIF</span>
                <span className="text-[11px] text-on-surface-variant">Souret l outfit aw l lebes li btbayan bi hal khesseh</span>
                <button
                  type="button"
                  onClick={() => handleOpenGifPicker('mediaSlot', null, 'dressGif', 'Na22i GIF L Lebes', mediaSlots.dressGif)}
                  className="text-[11px] font-bold text-primary hover:text-rose-700 flex items-center gap-1 cursor-pointer w-fit mt-0.5"
                >
                  <ImageIcon size={12} />
                  <span>Ghayyir L GIF • Change</span>
                </button>
              </div>
            </div>

            {/* Checklist Editor */}
            <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80">
              <label className="block text-xs font-bold text-on-surface mb-3">
                Shourout L Lebes L Elzamiyeh (Mandatory Checklist):
              </label>

              <div className="flex flex-col gap-2.5 mb-4">
                {dressConfig.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">
                      ✓
                    </div>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDressConfig(prev => ({
                          ...prev,
                          checklist: prev.checklist.map((it, i) => i === idx ? val : it)
                        }));
                      }}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-sm text-on-surface outline-none focus:border-primary shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(idx)}
                      className="p-2 text-red-400 hover:text-red-600 cursor-pointer transition-colors"
                      title="Shahel l shart"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Zid shart mahdoum (matalan: L 3eter lezem ykoun feye7)..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-rose-200 text-sm text-on-surface outline-none focus:border-primary shadow-xs"
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  className="px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-container font-label-md text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  <span>Zid • Add</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Screen 6 Date Finale & Celebration Editor */}
        {activeTab === 'final' && (
          <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-rose-200/90 p-6 sm:p-8 shadow-[0_20px_50px_rgba(185,0,64,0.08)] mb-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-rose-100">
              <div>
                <h3 className="font-title-editorial text-xl font-bold text-on-surface">
                  Screen 6: Date Finale & Celebration • L Khetam wl Fara7
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Nafizet l e7tefal l akhireh lama tkabbes YES w tkhalles kel l khotwat! 🥂
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-primary text-xs font-bold">
                🎉 Mar7aleh 6 • L Finale
              </span>
            </div>

            {/* Visual Media Slot for Finale */}
            <div className="p-4 rounded-2xl bg-white border border-rose-200/80 mb-6 shadow-xs flex items-center gap-4">
              <img
                src={mediaSlots.finalGif}
                alt="Finale Celebration GIF"
                className="w-20 h-20 object-cover rounded-xl border border-rose-200 shadow-xs shrink-0"
              />
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-xs font-bold text-on-surface">Finale Celebration GIF</span>
                <span className="text-[11px] text-on-surface-variant">Souret l ra2sa wl e7tefal l rasmiyeh bel date</span>
                <button
                  type="button"
                  onClick={() => handleOpenGifPicker('mediaSlot', null, 'finalGif', 'Na22i GIF L Finale', mediaSlots.finalGif)}
                  className="text-[11px] font-bold text-primary hover:text-rose-700 flex items-center gap-1 cursor-pointer w-fit mt-0.5"
                >
                  <ImageIcon size={12} />
                  <span>Ghayyir L GIF • Change</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Finale Title • 3enwan L E7tefal L Akhir
                </label>
                <input
                  type="text"
                  value={content.final.title}
                  onChange={(e) => setContent(prev => ({ ...prev, final: { ...prev.final, title: e.target.value } }))}
                  placeholder="IT'S A DATE. ❤️ • Khalas 3ala2na!"
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1.5">
                  Finale Message • Risalet L Mabrouk wl Zekra
                </label>
                <textarea
                  rows={3}
                  value={content.final.message}
                  onChange={(e) => setContent(prev => ({ ...prev, final: { ...prev.final, message: e.target.value } }))}
                  placeholder="Mabrouk! Wefe2ti tkayyfi ma3e bi a7la date bi Lebnan. Screenshot hayde l saf7a w 5abbiya zekra! 🇱🇧🥂"
                  className="w-full px-4 py-3 rounded-xl bg-rose-50/40 hover:bg-rose-50/70 focus:bg-white border border-rose-200/80 text-on-surface font-body-md outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-primary shadow-sm transition-all resize-none"
                />
              </div>
            </div>

            {/* Confirmed Itinerary WhatsApp Card Preview */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
              <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold text-xs">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Tazkaret L Date 3al WhatsApp • Auto Confirmed Itinerary Ticket</span>
              </div>
              <p className="text-xs text-emerald-900/80 leading-relaxed">
                Bass tekhlos l da3weh, l system byawallad message monasba 3al WhatsApp bte7wi kel l khotwat (l matra7: <span className="font-bold">{locations[0]?.name || 'Sunset'}</span>, l akel: <span className="font-bold">{options[0]?.name || 'Pizza'}</span>, wl wa2et: <span className="font-bold">{scheduleConfig.text}</span>) la ykoun l ettafaq rasmi w zekra 7elweh!
              </p>
            </div>
          </div>
        )}

        {/* Tab 7: Colors & Theme Customizer */}
        {activeTab === 'theme' && (
          <div className="rounded-3xl bg-white/95 backdrop-blur-2xl border border-rose-200/90 p-6 sm:p-8 shadow-[0_20px_50px_rgba(185,0,64,0.08)] mb-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-rose-100">
              <div>
                <h3 className="font-title-editorial text-xl font-bold text-on-surface">
                  Screen 7: Visual Themes & Color Palette • L Alwan wl Style L Khas
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Na22i palet l alwan li btetlawe2 ma3 shakhsiyyetkoun w bte3ti l da3weh vibe luxury sa7er ✨
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-primary text-xs font-bold">
                🎨 Mar7aleh 7 • L Alwan
              </span>
            </div>

            {/* 6 Luxury Curated Theme Cards */}
            <div className="mb-8">
              <label className="block text-xs font-bold text-on-surface mb-3">
                1. Na22i Theme L Khesseh L Ra2isi • Curated Luxury Color Palettes:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {THEME_OPTIONS.map((th) => {
                  const isSelected = selectedThemeId === th.id;
                  return (
                    <div
                      key={th.id}
                      onClick={() => {
                        setSelectedThemeId(th.id);
                        setCustomAccentColor('');
                        sound.playPop();
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 shadow-xs ${
                        isSelected
                          ? 'border-primary bg-rose-50/50 shadow-md scale-[1.02]'
                          : 'border-rose-100/90 bg-white hover:border-rose-300 hover:bg-rose-50/20'
                      }`}
                    >
                      {/* Visual Color Palette Swatches Preview */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-6 h-6 rounded-full border border-white shadow-xs"
                            style={{ backgroundColor: th.primaryColor }}
                            title="Primary Accent"
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-white/50 shadow-xs"
                            style={{ backgroundColor: th.secondaryColor }}
                            title="Secondary Accent"
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-white/30 shadow-xs"
                            style={{ backgroundColor: th.backgroundColor }}
                            title="Deep Background"
                          />
                        </div>

                        {isSelected && (
                          <span className="px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                            ✓ Mokhtar • Active
                          </span>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-sm text-on-surface flex items-center gap-1.5">
                          <span>{th.name}</span>
                          <span className="text-xs font-semibold text-primary">({th.badge})</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                          {th.description}
                        </p>
                      </div>

                      {/* Mini color ribbon preview */}
                      <div className="w-full h-2 rounded-full overflow-hidden flex shadow-inner">
                        <div style={{ backgroundColor: th.backgroundColor, width: '40%' }} />
                        <div style={{ backgroundColor: th.wine, width: '30%' }} />
                        <div style={{ backgroundColor: th.primaryColor, width: '30%' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Accent Color Override */}
            <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface">
                    2. Khasis Lon L Accent 3ala Zaw2ak • Custom Accent Color (Optional)
                  </label>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Fik tna22i ayya hex color baddak yeh la ykoun lon kabsat YES, l glow, wl headlines!
                  </p>
                </div>

                {customAccentColor && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomAccentColor('');
                      sound.playPop();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-[11px] font-bold text-on-surface-variant hover:text-red-600 hover:border-red-200 cursor-pointer shadow-xs transition-colors shrink-0"
                  >
                    <RefreshCw size={12} />
                    <span>Rajje3 Lon L Theme L Asli</span>
                  </button>
                )}
              </div>

              {/* Color Picker Control + Quick Palette Chips */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white border border-rose-200 shadow-xs">
                  <input
                    type="color"
                    value={customAccentColor || THEME_OPTIONS.find(t => t.id === selectedThemeId)?.primaryColor || '#ff4d6d'}
                    onChange={(e) => setCustomAccentColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
                    title="Na22i lon bte5taro"
                  />
                  <input
                    type="text"
                    value={customAccentColor || THEME_OPTIONS.find(t => t.id === selectedThemeId)?.primaryColor || '#ff4d6d'}
                    onChange={(e) => setCustomAccentColor(e.target.value)}
                    placeholder="#ff4d6d"
                    className="w-24 text-xs font-mono font-bold text-on-surface outline-none uppercase"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {QUICK_ACCENTS.map((qa, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setCustomAccentColor(qa.color);
                        sound.playPop();
                      }}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                        (customAccentColor === qa.color || (!customAccentColor && THEME_OPTIONS.find(t => t.id === selectedThemeId)?.primaryColor === qa.color))
                          ? 'bg-white border-primary text-primary shadow-xs'
                          : 'bg-white border-rose-200/80 text-on-surface-variant hover:border-rose-300'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: qa.color }} />
                      <span>{qa.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Mini Preview Box */}
            <div className="p-6 rounded-3xl border border-rose-200/90 shadow-sm relative overflow-hidden"
              style={{
                backgroundColor: THEME_OPTIONS.find(t => t.id === selectedThemeId)?.backgroundColor || '#0f0207',
                backgroundImage: `radial-gradient(ellipse 90% 70% at 50% 0%, ${THEME_OPTIONS.find(t => t.id === selectedThemeId)?.burgundy || '#3a0820'} 0%, transparent 65%), radial-gradient(ellipse 70% 50% at 50% 100%, ${THEME_OPTIONS.find(t => t.id === selectedThemeId)?.wine || '#220412'} 0%, ${THEME_OPTIONS.find(t => t.id === selectedThemeId)?.backgroundColor || '#0f0207'} 100%)`
              }}
            >
              <div className="text-center max-w-sm mx-auto">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold text-white/90 bg-white/10 backdrop-blur-md border border-white/20 mb-3">
                  Live Mini Preview • Shakel L Da3weh Bil Lon L Mokhtar ✨
                </span>

                <p className="text-xs text-white/70 mb-1">
                  {content.openingText || 'I have a very important question for you…'}
                </p>

                <h4
                  className="text-lg font-bold mb-4 font-title-editorial"
                  style={{ color: customAccentColor || THEME_OPTIONS.find(t => t.id === selectedThemeId)?.primaryColor || '#ff4d6d' }}
                >
                  {content.questionText || 'Will you go on a date with me? ❤️'}
                </h4>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    className="px-5 py-2 rounded-full font-bold text-xs text-white shadow-lg transition-transform hover:scale-105"
                    style={{
                      backgroundColor: customAccentColor || THEME_OPTIONS.find(t => t.id === selectedThemeId)?.primaryColor || '#ff4d6d',
                      boxShadow: THEME_OPTIONS.find(t => t.id === selectedThemeId)?.glow || '0 0 20px rgba(255, 77, 109, 0.45)'
                    }}
                  >
                    {content.yesButtonText || 'YES ❤️'}
                  </button>

                  <button
                    type="button"
                    className="px-4 py-2 rounded-full font-semibold text-xs text-white/70 bg-white/10 border border-white/20"
                  >
                    {content.noButtonText || 'NO'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating/Bottom Action Bar */}
        <div className="sticky bottom-6 z-40 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || invitation?.isClaimed}
            className={`relative group overflow-hidden px-8 py-3.5 rounded-full font-label-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-lg flex items-center gap-2.5 cursor-pointer ${
              invitation?.isClaimed
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300'
                : 'bg-gradient-to-r from-primary via-rose-600 to-primary-container text-white shadow-rose-500/35 hover:shadow-rose-500/50 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {/* Shimmer sweep */}
            <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 pointer-events-none"></div>

            {invitation?.isClaimed ? (
              <>
                <Lock size={18} />
                <span>L Khesseh Ma2fouleh w Mwasqa 💍 Sealed</span>
              </>
            ) : saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>3am n7faz kel l ta3dilat... ✨</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>7faz Kel L Ta3dilat • Save All Changes ✨</span>
              </>
            )}
          </button>
        </div>
      </main>

      {/* GIF Library Picker Modal */}
      <GifPickerModal
        isOpen={gifPicker.open}
        title={gifPicker.title}
        currentGifUrl={gifPicker.currentUrl}
        onClose={() => setGifPicker(prev => ({ ...prev, open: false }))}
        onSelect={handleGifSelected}
      />

      {/* Activity Library & Custom Activity Picker Modal */}
      <ActivityPickerModal
        isOpen={activityPicker.open}
        title={activityPicker.title}
        slotLabel={activityPicker.slotLabel}
        initialSlotIndex={activityPicker.targetIndex}
        slotOptions={
          activityPicker.targetType === 'location'
            ? locations.map((loc, i) => ({ index: i, label: `Card #${i + 1} (${loc.name || 'Venue ' + (i + 1)})` }))
            : options.map((opt, i) => ({ index: i, label: `Card #${i + 1} (${opt.name || 'Option ' + (i + 1)})` }))
        }
        onClose={() => setActivityPicker(prev => ({ ...prev, open: false }))}
        onSelectActivity={handleActivitySelected}
      />
    </div>
  );
}
