import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  getDoc
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { db, auth } from './firebase';
import {
  Lock,
  Unlock,
  X,
  Search,
  ArrowRight,
  Send,
  Upload,
  Trash2,
  Edit3,
  Loader2,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  Settings,
  FolderKanban,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  MessageSquareShare,
  CloudUpload
} from 'lucide-react';

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const DEFAULT_SETTINGS = {
  name: "Mehdi",
  avatarLogo: "",
  role: "Directeur Artistique & Designer UI/UX",
  statusText: "Disponible pour nouveaux mandats",
  heroTitleLine1: "Design visuel sobre,",
  heroTitleLine2: "identités & interfaces modernes.",
  heroSubtitle: "Création de systèmes d'identités pérennes, logotypes vectoriels et maquettes web à forte valeur perçue.",
  contactEmail: "contact@mehdi-design.com",
  contactLocation: "Paris, France • À distance",
  contactPhone: "06 00 00 00 00",
  contactWhatsapp: "33600000000",
  contactGithub: "https://github.com/mehdiBdsDZ",
  contactFacebook: "https://facebook.com",
  telegramWebhookUrl: "",
  imageApiKey: "",
  heroImages: [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1920&q=80"
  ],
  categories: [
    { id: 'logo', label: 'Logos' },
    { id: 'site', label: 'Maquettes Web' }
  ]
};

export default function App() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [modalImageLoaded, setModalImageLoaded] = useState(false);
  const [imageErrorState, setImageErrorState] = useState({});

  const [notification, setNotification] = useState(null);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const carouselRef = useRef(null);
  const isInteractingRef = useRef(false);
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollStartRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const animFrameIdRef = useRef(null);

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState('projects');
  const [adminProjectSearch, setAdminProjectSearch] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingToApi, setIsUploadingToApi] = useState(false);

  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'logo',
    description: '',
    images: [],
    client: '',
    year: '2026',
    tags: ''
  });
  const [formImagesText, setFormImagesText] = useState('');

  const [tempSettings, setTempSettings] = useState(DEFAULT_SETTINGS);
  const [tempHeroImagesText, setTempHeroImagesText] = useState('');
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatId, setNewCatId] = useState('');

  const [contactName, setContactName] = useState('');
  const [contactPhoneInput, setContactPhoneInput] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const contactSectionRef = useRef(null);
  const subjectInputRef = useRef(null);
  const drawerContainerRef = useRef(null);

  const [imageLoadedState, setImageLoadedState] = useState({});

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  useEffect(() => {
    const heroList = settings.heroImages || [];
    if (heroList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide(prev => (prev + 1) % heroList.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [settings.heroImages]);

  const filteredProjects = projects.filter(p => {
    const matchCategory = activeTab === 'all' || p.category === activeTab;
    const matchSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const shouldScroll = filteredProjects.length >= 4;

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }

    const el = carouselRef.current;
    if (!el || loading || !shouldScroll) return;

    let speed = 0.85;

    const loop = () => {
      const halfWidth = el.scrollWidth / 2;

      if (!isInteractingRef.current) {
        el.scrollLeft += speed;
      }

      if (el.scrollLeft >= halfWidth) {
        el.scrollLeft -= halfWidth;
      } else if (el.scrollLeft <= 0 && isInteractingRef.current) {
        el.scrollLeft += halfWidth;
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [loading, activeTab, searchQuery, shouldScroll]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const secretsSnap = await getDoc(doc(db, 'config', 'secrets'));
          if (secretsSnap.exists()) {
            const data = secretsSnap.data();
            setTempSettings(prev => ({ ...prev, imageApiKey: data.imageApiKey || '' }));
            setSettings(prev => ({ ...prev, imageApiKey: data.imageApiKey || '' }));
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setIsAuthenticated(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleMouseDown = (e) => {
    if (!carouselRef.current || !shouldScroll) return;
    isMouseDownRef.current = true;
    isInteractingRef.current = true;
    dragDistanceRef.current = 0;
    startXRef.current = e.pageX - carouselRef.current.offsetLeft;
    scrollStartRef.current = carouselRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isMouseDownRef.current || !carouselRef.current || !shouldScroll) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    dragDistanceRef.current = Math.abs(walk);
    carouselRef.current.scrollLeft = scrollStartRef.current - walk;
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      dragDistanceRef.current = 0;
    }, 80);
  };

  const handleTouchStart = () => {
    if (shouldScroll) isInteractingRef.current = true;
  };

  const handleTouchEnd = () => {
    if (shouldScroll) isInteractingRef.current = false;
  };

  const handleCardClick = (project) => {
    if (dragDistanceRef.current > 6) return;
    openProjectModal(project);
  };

  const uploadFileToHost = async (file) => {
    const key = settings.imageApiKey || tempSettings.imageApiKey;
    if (!key) {
      throw new Error("Clé d'API d'hébergement manquante. Configurez-la dans l'onglet Réseaux & Telegram.");
    }
    const form = new FormData();
    form.append('image', file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${key}`, {
      method: 'POST',
      body: form
    });
    const json = await res.json();
    if (!json.success) {
      throw new Error(json.error?.message || "Erreur lors de l'hébergement de l'image");
    }
    return json.data.url;
  };

  const handleDirectImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      setIsUploadingToApi(true);
      const uploadedUrls = [];

      for (const file of files) {
        showNotification(`Téléversement de ${file.name}...`);
        const url = await uploadFileToHost(file);
        uploadedUrls.push(url);
      }

      setFormImagesText(prev => {
        const existing = prev ? prev.trim() + '\n' : '';
        return existing + uploadedUrls.join('\n');
      });

      showNotification(`${uploadedUrls.length} image(s) hébergée(s) avec succès !`);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsUploadingToApi(false);
      e.target.value = '';
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingToApi(true);
      showNotification("Téléversement du logo vers l'API...");
      const url = await uploadFileToHost(file);
      setTempSettings(prev => ({ ...prev, avatarLogo: url }));
      showNotification('Logo hébergé avec succès !');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsUploadingToApi(false);
      e.target.value = '';
    }
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);

      const settingsRef = doc(db, 'config', 'general');
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        const loadedSettings = { ...DEFAULT_SETTINGS, ...settingsSnap.data() };
        setSettings(loadedSettings);
        setTempSettings(loadedSettings);
        setTempHeroImagesText((loadedSettings.heroImages || []).join('\n'));
      } else {
        setTempHeroImagesText(DEFAULT_SETTINGS.heroImages.join('\n'));
      }

      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(d => {
        const data = d.data();
        let images = [];
        if (Array.isArray(data.images) && data.images.length > 0) {
          images = data.images;
        } else if (data.image) {
          images = [data.image];
        }
        return {
          id: d.id,
          ...data,
          images
        };
      });
      setProjects(list);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      showNotification('Connexion réussie');
      setAdminPassword('');
    } catch (err) {
      setAuthError('Identifiants incorrects ou accès refusé');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAdminOpen(false);
      showNotification('Déconnexion effectuée');
    } catch (err) {
      showNotification('Erreur de déconnexion', 'error');
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tagArray = typeof formData.tags === 'string'
      ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      : formData.tags;

    const urlsFromText = formImagesText
      .split('\n')
      .map(u => u.trim())
      .filter(Boolean);

    if (urlsFromText.length === 0) {
      showNotification('Ajoutez au moins une image au projet.', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        images: urlsFromText,
        image: urlsFromText[0],
        client: formData.client,
        year: formData.year,
        tags: tagArray
      };

      if (editingProject) {
        await updateDoc(doc(db, 'projects', editingProject.id), payload);
        showNotification('Réalisation mise à jour avec succès');
      } else {
        await addDoc(collection(db, 'projects'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        showNotification('Nouvelle réalisation enregistrée');
      }

      await fetchAllData();
      setEditingProject(null);
      setFormData({
        title: '',
        category: settings.categories[0]?.id || 'logo',
        description: '',
        images: [],
        client: '',
        year: '2026',
        tags: ''
      });
      setFormImagesText('');
      setAdminTab('projects');
    } catch (err) {
      showNotification("Erreur lors de l'enregistrement : " + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitting(true);
    try {
      const heroImagesArray = tempHeroImagesText
        .split('\n')
        .map(url => url.trim())
        .filter(Boolean);

      const { imageApiKey, ...publicSettings } = tempSettings;

      const finalPublicSettings = {
        ...publicSettings,
        heroImages: heroImagesArray
      };

      await setDoc(doc(db, 'config', 'general'), finalPublicSettings);
      await setDoc(doc(db, 'config', 'secrets'), { imageApiKey: imageApiKey || '' });

      setSettings(tempSettings);
      showNotification('Paramètres et clés enregistrés en toute sécurité');
    } catch (err) {
      showNotification('Erreur de sauvegarde : ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCategory = () => {
    if (!newCatLabel || !newCatId) return;
    const cleanId = newCatId.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
    if (tempSettings.categories.some(c => c.id === cleanId)) {
      showNotification('Cette catégorie existe déjà', 'error');
      return;
    }
    const updated = {
      ...tempSettings,
      categories: [...tempSettings.categories, { id: cleanId, label: newCatLabel.trim() }]
    };
    setTempSettings(updated);
    setNewCatLabel('');
    setNewCatId('');
  };

  const removeCategory = (idToRemove) => {
    if (tempSettings.categories.length <= 1) {
      showNotification('Conservez au moins une catégorie', 'error');
      return;
    }
    const updated = {
      ...tempSettings,
      categories: tempSettings.categories.filter(c => c.id !== idToRemove)
    };
    setTempSettings(updated);
  };

  const moveCategory = (index, direction) => {
    const list = [...tempSettings.categories];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    setTempSettings({ ...tempSettings, categories: list });
  };

  const startEdit = (project) => {
    setEditingProject(project);
    const existingImages = Array.isArray(project.images) && project.images.length > 0
      ? project.images
      : (project.image ? [project.image] : []);

    setFormData({
      title: project.title,
      category: project.category,
      description: project.description,
      images: existingImages,
      client: project.client || '',
      year: project.year || '2026',
      tags: Array.isArray(project.tags) ? project.tags.join(', ') : ''
    });
    setFormImagesText(existingImages.join('\n'));
    setAdminTab('form');
  };

  const deleteProject = async (id) => {
    if (!confirm('Supprimer cette réalisation ?')) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
      setProjects(prev => prev.filter(p => p.id !== id));
      if (selectedProject?.id === id) setSelectedProject(null);
      showNotification('Projet supprimé');
    } catch (err) {
      showNotification('Erreur : ' + err.message, 'error');
    }
  };

  const openProjectModal = (proj) => {
    setSelectedProject(proj);
    setModalImageIndex(0);
    setModalImageLoaded(false);
  };

  const handleContactSimilar = (project) => {
    setContactSubject(`Demande pour : ${project.title}`);
    setSelectedProject(null);
    setTimeout(() => {
      if (contactSectionRef.current) {
        contactSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (subjectInputRef.current) {
        subjectInputRef.current.focus();
      }
    }, 150);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setIsSendingMessage(true);

    const webhookUrl = settings.telegramWebhookUrl;

    if (!webhookUrl) {
      showNotification("URL du relais de contact manquante dans l'admin.", "error");
      setIsSendingMessage(false);
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: contactName,
          phone: contactPhoneInput,
          subject: contactSubject,
          message: contactMessage
        })
      });

      showNotification('Message envoyé avec succès ! Nous vous recontacterons sous peu.');
      setContactName('');
      setContactPhoneInput('');
      setContactSubject('');
      setContactMessage('');
    } catch (err) {
      showNotification("Échec de l'envoi : " + err.message, "error");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const renderProjectCard = (project, uniqueKey) => {
    const isLoaded = imageLoadedState[`${project.id}_${uniqueKey}`];
    const hasError = imageErrorState[`${project.id}_${uniqueKey}`];
    const categoryObj = settings.categories?.find(c => c.id === project.category);
    const isLogo = project.category === 'logo';
    const firstImage = (project.images && project.images[0]) || project.image;
    const hasMultipleImages = project.images && project.images.length > 1;

    return (
      <div
        key={uniqueKey}
        onClick={() => handleCardClick(project)}
        className="shrink-0 w-[300px] sm:w-[350px] group cursor-pointer rounded-2xl bg-[#0f0f12] border border-zinc-800/60 hover:border-zinc-700 overflow-hidden transition-all duration-300 flex flex-col shadow-lg mx-3 select-none"
      >
        <div className="relative aspect-[16/10] w-full bg-gradient-to-b from-zinc-900 to-zinc-950 flex items-center justify-center p-5 overflow-hidden border-b border-zinc-800/40 pointer-events-none">
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 bg-zinc-900/90 animate-pulse flex flex-col items-center justify-center gap-2">
              <ImageIcon className="w-6 h-6 text-zinc-700 animate-pulse" />
              <span className="text-[10px] font-mono text-zinc-600">Chargement...</span>
            </div>
          )}

          {hasError ? (
            <div className="flex flex-col items-center justify-center gap-2 text-zinc-600">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-zinc-500" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Image indisponible</span>
            </div>
          ) : (
            <img
              src={firstImage}
              alt={project.title}
              draggable={false}
              onLoad={() => setImageLoadedState(prev => ({ ...prev, [`${project.id}_${uniqueKey}`]: true }))}
              onError={() => setImageErrorState(prev => ({ ...prev, [`${project.id}_${uniqueKey}`]: true }))}
              className={`transition-all duration-700 group-hover:scale-105 ${isLogo
                ? 'max-h-28 max-w-[75%] object-contain drop-shadow-md'
                : 'w-full h-full object-cover'
                } ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          )}

          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 text-zinc-300">
              {categoryObj?.label || project.category}
            </span>
          </div>

          {hasMultipleImages && !hasError && (
            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>{project.images.length}</span>
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between pointer-events-none">
          <div>
            <h3 className="text-sm font-medium text-white group-hover:text-zinc-200 transition-colors truncate">
              {project.title}
            </h3>
            <p className="mt-1.5 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/40 flex items-center justify-between text-xs text-zinc-500">
            <span>{project.client}</span>
            <span className="inline-flex items-center gap-1 text-zinc-400 group-hover:text-white transition-colors font-medium">
              Détails <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-700 selection:text-white relative">
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 shadow-2xl animate-fade-in">
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs text-zinc-200">{notification.message}</span>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col items-center justify-center transition-opacity duration-500">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-lg text-white mb-4 animate-bounce">
            {settings.name?.charAt(0) || 'M'}
          </div>
          <div className="w-32 h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div className="w-full h-full bg-zinc-400 origin-left animate-pulse" />
          </div>
          <span className="mt-3 text-[11px] font-mono uppercase tracking-widest text-zinc-500">Chargement du studio</span>
        </div>
      )}

      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-[#09090b]/80 border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-3 group">
            {settings.avatarLogo && !imageErrorState['header_logo'] ? (
              <img
                src={settings.avatarLogo}
                alt={settings.name}
                onError={() => setImageErrorState(prev => ({ ...prev, header_logo: true }))}
                className="w-10 h-10 rounded-xl object-contain bg-zinc-900 border border-zinc-700/60 p-1 group-hover:border-zinc-500 transition-colors"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-zinc-700 to-zinc-900 border border-zinc-700/60 flex items-center justify-center font-bold text-lg text-white group-hover:border-zinc-500 transition-colors">
                {settings.name?.charAt(0) || 'M'}
              </div>
            )}
            <div>
              <span className="font-semibold tracking-tight text-white block uppercase">{settings.name}</span>
              <span className="text-[10px] tracking-widest text-zinc-400 uppercase font-mono block">{settings.role}</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#portfolio" className="hover:text-white transition-colors">Projets</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </nav>

          <a
            href="#contact"
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white transition-all shadow-sm"
          >
            Démarrer un projet
          </a>
        </div>
      </header>

      <section className="relative min-h-[85vh] flex items-center px-6 pt-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {(settings.heroImages || []).map((imgUrl, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${idx === currentHeroSlide ? 'opacity-35 scale-100' : 'opacity-0 scale-105'
                }`}
              style={{ backgroundImage: `url('${imgUrl}')` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-[#09090b]/90" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md text-xs text-zinc-400 mb-6 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {settings.statusText}
            </div>
            <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-zinc-100 leading-[1.15]">
              {settings.heroTitleLine1} <br />
              <span className="font-semibold text-white">{settings.heroTitleLine2}</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl font-normal drop-shadow-sm">
              {settings.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      <section id="portfolio" className="py-12 px-6 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === 'all'
                ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                : 'text-zinc-400 hover:text-white bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700'
                }`}
            >
              Toutes les créations
            </button>
            {settings.categories?.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === cat.id
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Rechercher une réalisation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden py-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="shrink-0 w-[300px] sm:w-[350px] rounded-2xl bg-[#0f0f12] border border-zinc-800/50 overflow-hidden">
                <div className="aspect-[16/10] bg-zinc-900/80 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/60" />
                </div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-zinc-800/80 rounded w-2/3 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-zinc-800/50 rounded w-full animate-pulse" />
                    <div className="h-2.5 bg-zinc-800/40 rounded w-4/5 animate-pulse" />
                  </div>
                  <div className="pt-3 border-t border-zinc-800/40 flex justify-between items-center">
                    <div className="h-3 bg-zinc-800/40 rounded w-1/4 animate-pulse" />
                    <div className="h-3 bg-zinc-800/60 rounded w-16 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
            <p className="text-sm text-zinc-500">Aucun projet trouvé.</p>
          </div>
        ) : (
          <div
            ref={carouselRef}
            onMouseEnter={() => { if (shouldScroll) isInteractingRef.current = true; }}
            onMouseLeave={() => { if (shouldScroll) { isInteractingRef.current = false; handleMouseUp(); } }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`w-full overflow-x-auto no-scrollbar py-4 ${shouldScroll ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
            <div className={`flex w-max ${!shouldScroll ? 'justify-start md:justify-center w-full' : ''}`}>
              <div className="flex shrink-0">
                {filteredProjects.map((p, idx) => renderProjectCard(p, `main_${p.id}_${idx}`))}
              </div>
              {shouldScroll && (
                <div className="flex shrink-0" aria-hidden="true">
                  {filteredProjects.map((p, idx) => renderProjectCard(p, `loop_${p.id}_${idx}`))}
                </div>
              )}
            </div>
          </div>
        )}

        {filteredProjects.length > 0 && (
          <div className="mt-8 flex flex-col items-center">
            <button
              onClick={() => {
                setIsDrawerOpen(!isDrawerOpen);
                if (!isDrawerOpen) {
                  setTimeout(() => {
                    drawerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-xs font-medium text-zinc-300 hover:text-white transition-all shadow-md group"
            >
              <span>{isDrawerOpen ? 'Replier le catalogue' : `Voir la grille complète (${filteredProjects.length})`}</span>
              <div className={`p-1 rounded-full bg-zinc-800 group-hover:bg-zinc-700 transition-transform duration-300 ${isDrawerOpen ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </button>

            {isDrawerOpen && (
              <div
                ref={drawerContainerRef}
                className="w-full mt-8 p-6 rounded-3xl bg-[#0d0d10] border border-zinc-800/80 animate-fade-in transition-all"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/60">
                  <div>
                    <h3 className="text-base font-semibold text-white">Toutes les créations</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Mosaïque intégrale des projets correspondant à votre sélection.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map((p) => {
                    const firstImg = (p.images && p.images[0]) || p.image;
                    const isLogo = p.category === 'logo';
                    const hasError = imageErrorState[`drawer_${p.id}`];

                    return (
                      <div
                        key={`drawer_grid_${p.id}`}
                        onClick={() => openProjectModal(p)}
                        className="group cursor-pointer rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700 overflow-hidden flex flex-col transition-all"
                      >
                        <div className="aspect-[16/10] bg-zinc-950 flex items-center justify-center p-4 overflow-hidden border-b border-zinc-800/40 relative">
                          {hasError ? (
                            <div className="flex flex-col items-center justify-center gap-1.5 text-zinc-600">
                              <ImageIcon className="w-5 h-5 text-zinc-600" />
                              <span className="text-[9px] font-mono uppercase text-zinc-500">Non disponible</span>
                            </div>
                          ) : (
                            <img
                              src={firstImg}
                              alt={p.title}
                              onError={() => setImageErrorState(prev => ({ ...prev, [`drawer_${p.id}`]: true }))}
                              className={`transition-transform duration-500 group-hover:scale-105 ${isLogo ? 'max-h-24 max-w-[70%] object-contain' : 'w-full h-full object-cover'}`}
                            />
                          )}
                          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[9px] font-mono uppercase rounded bg-black/70 border border-zinc-800 text-zinc-300">
                            {settings.categories?.find(c => c.id === p.category)?.label || p.category}
                          </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-white truncate group-hover:text-zinc-200">{p.title}</h4>
                            <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{p.description}</p>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-500">
                            <span>{p.client} &bull; {p.year}</span>
                            <span className="text-zinc-400 group-hover:text-white flex items-center gap-1 font-medium">Consulter <ArrowRight className="w-3 h-3" /></span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="bg-[#111114] border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-[#111114]/90 backdrop-blur-md border-b border-zinc-800/60">
              <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                {settings.categories?.find(c => c.id === selectedProject.category)?.label || selectedProject.category}
              </span>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800/60 flex items-center justify-center p-4 min-h-[320px] max-h-[520px]">
                {!modalImageLoaded && !imageErrorState[`modal_${selectedProject.id}_${modalImageIndex}`] && (
                  <div className="absolute inset-0 bg-zinc-950 animate-pulse flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-7 h-7 text-zinc-600 animate-spin" />
                    <span className="text-xs font-mono text-zinc-500">Affichage haute résolution...</span>
                  </div>
                )}

                {imageErrorState[`modal_${selectedProject.id}_${modalImageIndex}`] ? (
                  <div className="flex flex-col items-center justify-center gap-3 text-zinc-500 py-12">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <span className="text-xs font-mono">Impossible de charger cette image</span>
                  </div>
                ) : (
                  <img
                    src={(selectedProject.images && selectedProject.images[modalImageIndex]) || selectedProject.image}
                    alt={selectedProject.title}
                    onLoad={() => setModalImageLoaded(true)}
                    onError={() => {
                      setModalImageLoaded(true);
                      setImageErrorState(prev => ({ ...prev, [`modal_${selectedProject.id}_${modalImageIndex}`]: true }));
                    }}
                    className={`object-contain max-h-[480px] transition-opacity duration-300 ${selectedProject.category === 'logo' ? 'max-w-[70%]' : 'w-full'
                      } ${modalImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                )}

                {selectedProject.images && selectedProject.images.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        setModalImageLoaded(false);
                        setModalImageIndex(prev => (prev === 0 ? selectedProject.images.length - 1 : prev - 1));
                      }}
                      className="absolute left-3 p-2 rounded-full bg-zinc-900/80 border border-zinc-700 text-white hover:bg-zinc-800 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setModalImageLoaded(false);
                        setModalImageIndex(prev => (prev + 1) % selectedProject.images.length);
                      }}
                      className="absolute right-3 p-2 rounded-full bg-zinc-900/80 border border-zinc-700 text-white hover:bg-zinc-800 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {selectedProject.images && selectedProject.images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto p-2 no-scrollbar">
                  {selectedProject.images.map((img, idx) => {
                    const hasThumbError = imageErrorState[`modal_thumb_${selectedProject.id}_${idx}`];
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (modalImageIndex !== idx) {
                            setModalImageLoaded(false);
                            setModalImageIndex(idx);
                          }
                        }}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden border shrink-0 transition-all ${modalImageIndex === idx ? 'border-white scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'
                          }`}
                      >
                        {hasThumbError ? (
                          <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-500">
                            <ImageIcon className="w-4 h-4 text-zinc-600" />
                          </div>
                        ) : (
                          <img
                            src={img}
                            alt=""
                            onError={() => setImageErrorState(prev => ({ ...prev, [`modal_thumb_${selectedProject.id}_${idx}`]: true }))}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{selectedProject.title}</h2>
                  <p className="text-sm text-zinc-400 mt-1">{selectedProject.client} &bull; {selectedProject.year}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleContactSimilar(selectedProject)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Contacter pour un projet similaire
                </button>
              </div>

              <div className="border-t border-zinc-800/60 pt-4">
                <h4 className="text-xs font-mono uppercase text-zinc-400 mb-2">Description du projet</h4>
                <p className="text-zinc-300 text-sm leading-relaxed">{selectedProject.description}</p>
              </div>

              {selectedProject.tags && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedProject.tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-lg animate-fade-in">
          <div className="bg-[#0f0f13] border border-zinc-800/80 rounded-3xl max-w-5xl w-full h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="h-16 px-6 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white">
                  <Settings className="w-4 h-4 text-zinc-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Console Studio Mehdi</h3>
                  <span className="text-[10px] text-zinc-500 font-mono">Administration & Base Firestore</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-rose-400 hover:border-rose-500/30 text-xs transition-colors"
                >
                  Déconnexion
                </button>
                <button
                  onClick={() => setIsAdminOpen(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <form onSubmit={handleAuth} className="max-w-sm w-full space-y-4 p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-2">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-white">Espace Administrateur</h4>
                  <p className="text-xs text-zinc-400">Authentification sécurisée par Firebase Auth.</p>

                  <div className="space-y-2 text-left">
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">E-mail</label>
                      <input
                        type="email"
                        required
                        placeholder="admin@studio.com"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-zinc-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-400 block mb-1">Mot de passe</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-zinc-500 transition-all"
                      />
                    </div>
                    {authError && <p className="text-xs text-rose-400 pt-1 text-center">{authError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-2.5 bg-white text-zinc-950 font-semibold text-xs rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
                    Se connecter
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-zinc-800/80 p-4 space-y-1.5 bg-zinc-950/40 shrink-0">
                  {[
                    { id: 'projects', label: 'Projets existants', icon: FolderKanban, badge: projects.length },
                    { id: 'form', label: editingProject ? 'Modifier le projet' : 'Ajouter un projet', icon: Plus },
                    { id: 'general', label: 'Identité & Textes', icon: Sliders },
                    { id: 'contact', label: 'Réseaux & Telegram', icon: MessageSquareShare },
                    { id: 'categories', label: 'Ordre des Catégories', icon: Layers }
                  ].map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setAdminTab(tab.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${adminTab === tab.id
                          ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </div>
                        {tab.badge !== undefined && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${adminTab === tab.id ? 'bg-zinc-300 text-zinc-950' : 'bg-zinc-900 text-zinc-400'}`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0f0f13]">
                  {adminTab === 'projects' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="text-base font-semibold text-white">Gestionnaire des réalisations</h4>
                          <p className="text-xs text-zinc-500">Ajoutez, modifiez ou ordonnez les projets du catalogue.</p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingProject(null);
                            setFormData({ title: '', category: settings.categories[0]?.id || 'logo', description: '', images: [], client: '', year: '2026', tags: '' });
                            setFormImagesText('');
                            setAdminTab('form');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-white text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-all flex items-center gap-1.5 self-start"
                        >
                          <Plus className="w-3.5 h-3.5" /> Nouveau projet
                        </button>
                      </div>

                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Filtrer un projet par titre ou client..."
                          value={adminProjectSearch}
                          onChange={(e) => setAdminProjectSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-200 outline-none"
                        />
                      </div>

                      <div className="space-y-3">
                        {projects
                          .filter(p => p.title.toLowerCase().includes(adminProjectSearch.toLowerCase()) || p.client?.toLowerCase().includes(adminProjectSearch.toLowerCase()))
                          .map(p => {
                            const firstImg = (p.images && p.images[0]) || p.image;
                            const hasAdminThumbError = imageErrorState[`admin_thumb_${p.id}`];

                            return (
                              <div key={p.id} className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors">
                                <div className="flex items-center gap-3.5 overflow-hidden">
                                  {hasAdminThumbError ? (
                                    <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-500">
                                      <ImageIcon className="w-5 h-5 text-zinc-600" />
                                    </div>
                                  ) : (
                                    <img
                                      src={firstImg}
                                      alt=""
                                      onError={() => setImageErrorState(prev => ({ ...prev, [`admin_thumb_${p.id}`]: true }))}
                                      className="w-12 h-12 rounded-xl object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                                    />
                                  )}
                                  <div className="truncate">
                                    <h5 className="text-xs font-semibold text-white truncate">{p.title}</h5>
                                    <span className="text-[11px] text-zinc-400 block truncate">{p.client} &bull; {p.year}</span>
                                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-zinc-300">
                                      {settings.categories?.find(c => c.id === p.category)?.label || p.category}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button onClick={() => startEdit(p)} className="p-2 text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-lg transition-colors">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => deleteProject(p.id)} className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {adminTab === 'form' && (
                    <form onSubmit={handleSubmitProject} className="space-y-5 max-w-2xl">
                      <div>
                        <h4 className="text-base font-semibold text-white">{editingProject ? 'Éditer le projet' : 'Créer une nouvelle réalisation'}</h4>
                        <p className="text-xs text-zinc-500">Renseignez les détails, visuels multiples et mots-clés.</p>
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Titre de la réalisation</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-zinc-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Catégorie</label>
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-zinc-600"
                          >
                            {settings.categories?.map(c => (
                              <option key={c.id} value={c.id}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Client ou Projet</label>
                          <input
                            type="text"
                            value={formData.client}
                            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-zinc-600"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Téléversement direct d'images (Cloud API)</label>
                        <label className={`flex items-center justify-center gap-2 w-full py-3 bg-zinc-900 hover:bg-zinc-850 border border-dashed border-zinc-700 rounded-xl cursor-pointer text-xs text-zinc-300 hover:text-white transition-colors mb-2 ${isUploadingToApi ? 'opacity-50 pointer-events-none' : ''}`}>
                          {isUploadingToApi ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                              <span>Envoi vers le cloud en cours...</span>
                            </>
                          ) : (
                            <>
                              <CloudUpload className="w-4 h-4 text-emerald-400" />
                              <span className="font-medium">Importer depuis l'ordinateur ou le téléphone</span>
                            </>
                          )}
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleDirectImageUpload}
                            disabled={isUploadingToApi}
                            className="hidden"
                          />
                        </label>

                        <label className="text-[11px] text-zinc-500 block mb-1">Liens directs hébergés (générés automatiquement ou manuels)</label>
                        <textarea
                          rows="3"
                          placeholder="https://... (une URL par ligne)"
                          value={formImagesText}
                          onChange={(e) => setFormImagesText(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-zinc-600 font-mono text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Description détaillée</label>
                        <textarea
                          rows="3"
                          required
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-zinc-600"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Tags (séparés par virgule)</label>
                        <input
                          type="text"
                          placeholder="UI, Minimal, Vector"
                          value={formData.tags}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none focus:border-zinc-600"
                        />
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting || isUploadingToApi}
                          className="flex-1 py-3 bg-white text-zinc-950 font-semibold text-xs rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                          {editingProject ? 'Mettre à jour la réalisation' : 'Publier le projet'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdminTab('projects')}
                          className="px-5 py-3 border border-zinc-800 rounded-xl text-xs text-zinc-400 hover:text-white"
                        >
                          Retour
                        </button>
                      </div>
                    </form>
                  )}

                  {adminTab === 'general' && (
                    <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl">
                      <div>
                        <h4 className="text-base font-semibold text-white">Identité du Designer & Hero</h4>
                        <p className="text-xs text-zinc-500">Personnalisez votre nom, slogan d'en-tête et visuels d'arrière-plan.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Nom / Pseudo</label>
                          <input
                            type="text"
                            value={tempSettings.name}
                            onChange={(e) => setTempSettings({ ...tempSettings, name: e.target.value })}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Titre / Rôle</label>
                          <input
                            type="text"
                            value={tempSettings.role}
                            onChange={(e) => setTempSettings({ ...tempSettings, role: e.target.value })}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Logo officiel (affiché en haut à gauche)</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="URL directe de votre logo"
                            value={tempSettings.avatarLogo || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, avatarLogo: e.target.value })}
                            className="flex-1 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                        <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700 rounded-xl cursor-pointer text-xs text-zinc-400 hover:text-white transition-colors">
                          <Upload className="w-3.5 h-3.5" /> Charger un logo via l'API
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Statut disponibilité</label>
                        <input
                          type="text"
                          value={tempSettings.statusText}
                          onChange={(e) => setTempSettings({ ...tempSettings, statusText: e.target.value })}
                          className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Titre Hero - Ligne 1</label>
                          <input
                            type="text"
                            value={tempSettings.heroTitleLine1}
                            onChange={(e) => setTempSettings({ ...tempSettings, heroTitleLine1: e.target.value })}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Titre Hero - Ligne 2 (Gras)</label>
                          <input
                            type="text"
                            value={tempSettings.heroTitleLine2}
                            onChange={(e) => setTempSettings({ ...tempSettings, heroTitleLine2: e.target.value })}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Présentation / Sous-titre</label>
                        <textarea
                          rows="2"
                          value={tempSettings.heroSubtitle}
                          onChange={(e) => setTempSettings({ ...tempSettings, heroSubtitle: e.target.value })}
                          className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 block mb-1">Carrousel sombre d'arrière-plan (une URL par ligne)</label>
                        <textarea
                          rows="3"
                          value={tempHeroImagesText}
                          onChange={(e) => setTempHeroImagesText(e.target.value)}
                          className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-white text-zinc-950 font-semibold text-xs rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer les modifications
                      </button>
                    </form>
                  )}

                  {adminTab === 'contact' && (
                    <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl">
                      <div>
                        <h4 className="text-base font-semibold text-white">Canaux de communication & Clé API d'upload</h4>
                        <p className="text-xs text-zinc-500">Configurez votre clé d'hébergement d'images et la réception Telegram.</p>
                      </div>

                      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white">Clé API d'hébergement d'images (ImgBB API)</span>
                          <a
                            href="https://api.imgbb.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-zinc-400 hover:text-white underline"
                          >
                            Obtenir une clé gratuite
                          </a>
                        </div>
                        <input
                          type="text"
                          placeholder="Collez votre clé API ImgBB ici..."
                          value={tempSettings.imageApiKey || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, imageApiKey: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white outline-none font-mono"
                        />
                        <p className="text-[11px] text-zinc-500">
                          Permet au bouton « Importer » d'envoyer directement vos fichiers locaux dans le cloud sans blocage réseau.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Email public</label>
                          <input
                            type="email"
                            value={tempSettings.contactEmail || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, contactEmail: e.target.value })}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Localisation</label>
                          <input
                            type="text"
                            value={tempSettings.contactLocation || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, contactLocation: e.target.value })}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Téléphone affiché</label>
                          <input
                            type="text"
                            placeholder="06..."
                            value={tempSettings.contactPhone || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, contactPhone: e.target.value })}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">WhatsApp (format international, sans +)</label>
                          <input
                            type="text"
                            placeholder="Ex: 33600000000"
                            value={tempSettings.contactWhatsapp || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, contactWhatsapp: e.target.value })}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Profil GitHub</label>
                          <input
                            type="text"
                            value={tempSettings.contactGithub || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, contactGithub: e.target.value })}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-zinc-400 block mb-1">Page Facebook</label>
                          <input
                            type="text"
                            value={tempSettings.contactFacebook || ''}
                            onChange={(e) => setTempSettings({ ...tempSettings, contactFacebook: e.target.value })}
                            className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                        <span className="text-xs font-semibold text-white block">Relais de Contact Sécurisé (Google Apps Script / Webhook)</span>
                        <input
                          type="text"
                          placeholder="https://script.google.com/macros/s/.../exec"
                          value={tempSettings.telegramWebhookUrl || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, telegramWebhookUrl: e.target.value })}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white outline-none font-mono text-[11px]"
                        />
                        <p className="text-[11px] text-zinc-500">
                          Collez l'URL de votre application Web Google Apps Script déployée. Vos identifiants de bot Telegram restent ainsi invisibles pour les visiteurs.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-white text-zinc-950 font-semibold text-xs rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />} Enregistrer les canaux
                      </button>
                    </form>
                  )}

                  {adminTab === 'categories' && (
                    <div className="space-y-6 max-w-xl">
                      <div>
                        <h4 className="text-base font-semibold text-white">Ordre & Gestion des Catégories</h4>
                        <p className="text-xs text-zinc-500">
                          Utilisez les flèches haut/bas pour ordonner vos filtres selon vos souhaits.
                        </p>
                      </div>

                      <div className="space-y-2">
                        {tempSettings.categories?.map((c, idx) => (
                          <div
                            key={c.id}
                            className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-5 h-5 rounded-md bg-zinc-800 flex items-center justify-center font-mono text-[10px] text-zinc-400">
                                {idx + 1}
                              </span>
                              <span className="text-zinc-200 font-medium">
                                {c.label} <code className="text-[10px] text-zinc-500 font-mono">({c.id})</code>
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveCategory(idx, -1)}
                                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-300 transition-colors"
                                title="Monter"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === tempSettings.categories.length - 1}
                                onClick={() => moveCategory(idx, 1)}
                                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-300 transition-colors"
                                title="Descendre"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeCategory(c.id)}
                                className="p-1.5 text-rose-400 hover:text-rose-300 ml-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Nom (ex: Identités)"
                          value={newCatLabel}
                          onChange={(e) => setNewCatLabel(e.target.value)}
                          className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                        />
                        <input
                          type="text"
                          placeholder="ID (ex: identite)"
                          value={newCatId}
                          onChange={(e) => setNewCatId(e.target.value)}
                          className="w-28 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={addCategory}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white rounded-xl"
                        >
                          Ajouter
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleSaveSettings}
                        disabled={isSubmitting}
                        className="w-full py-3 bg-white text-zinc-950 font-semibold text-xs rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Enregistrer l'ordre et les catégories
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <section
        id="contact"
        ref={contactSectionRef}
        className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-900"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-light text-white tracking-tight">
              Parlons de votre prochain <br />
              <span className="font-semibold">projet graphique.</span>
            </h2>
            <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-md">
              Que ce soit pour un logotype vectoriel, une identité visuelle complète ou une maquette web sur mesure, je vous réponds sous 24h.
            </p>

            <div className="mt-8 space-y-4">
              {settings.contactEmail && (
                <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-3 text-xs text-zinc-300 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-zinc-500" />
                  <span>{settings.contactEmail}</span>
                </a>
              )}

              {settings.contactLocation && (
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                  <span>{settings.contactLocation}</span>
                </div>
              )}

              {settings.contactPhone && (
                <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-3 text-xs text-zinc-300 hover:text-white transition-colors">
                  <Phone className="w-4 h-4 text-zinc-500" />
                  <span>{settings.contactPhone}</span>
                </a>
              )}

              {settings.contactWhatsapp && (
                <a
                  href={`https://wa.me/${settings.contactWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-xs text-emerald-400/90 hover:text-emerald-300 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Discuter sur WhatsApp</span>
                </a>
              )}

              <div className="pt-2 flex items-center gap-4">
                {settings.contactGithub && (
                  <a
                    href={settings.contactGithub}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                    title="Profil GitHub"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </a>
                )}

                {settings.contactFacebook && (
                  <a
                    href={settings.contactFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                    title="Page Facebook"
                  >
                    <FacebookIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-6 sm:p-8 rounded-2xl bg-zinc-900/20 border border-zinc-800/80 space-y-4"
          >
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Votre Nom / Entreprise</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Ex: Entreprise / Studio"
                className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-zinc-200 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Votre numéro de téléphone</label>
              <input
                type="tel"
                required
                value={contactPhoneInput}
                onChange={(e) => setContactPhoneInput(e.target.value)}
                placeholder="Ex: 06 12 34 56 78"
                className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-zinc-200 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Sujet du projet</label>
              <input
                ref={subjectInputRef}
                type="text"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                placeholder="Ex: Refonte identité visuelle"
                className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-zinc-200 outline-none transition-all focus:ring-1 focus:ring-zinc-600"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Description de votre besoin</label>
              <textarea
                rows="4"
                required
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Décrivez votre vision, vos délais..."
                className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-800 focus:border-zinc-600 rounded-lg text-xs text-zinc-200 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSendingMessage}
              className="w-full py-3 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSendingMessage ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Envoyer le message
                </>
              )}
            </button>
          </form>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 max-w-7xl mx-auto gap-4">
        <span>&copy; {new Date().getFullYear()} {settings.name} &bull; Tous droits réservés.</span>

        <button
          onClick={() => setIsAdminOpen(true)}
          className="opacity-25 hover:opacity-100 transition-opacity p-2 text-zinc-600 hover:text-zinc-300 rounded-lg"
          title="Console d'administration"
        >
          {isAuthenticated ? <Unlock className="w-3.5 h-3.5 text-emerald-500" /> : <Lock className="w-3.5 h-3.5" />}
        </button>
      </footer>
    </div>
  );
}