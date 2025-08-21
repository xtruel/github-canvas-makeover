import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

// Import existing working images
import colosseocolosseoImage from '@/assets/colosseo-roma.jpg';
import pantheonImage from '@/assets/pantheon-interno.jpg';
import fontanaTreviImage from '@/assets/fontana-trevi-roma.jpg';
import piazzaSpagnaImage from '@/assets/piazza-spagna-roma.jpg';
import vitorianoImage from '@/assets/vittoriano-altare.jpg';
import trastevereImage from '@/assets/trastevere-roma.jpg';
import barRomanoImage from '@/assets/bar-romano.jpg';
import clubNotturnoImage from '@/assets/club-notturno.jpg';
import quartiereStoricoImage from '@/assets/quartiere-storico.jpg';

const RomaMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerHeight, setDrawerHeight] = useState(0.3); // 30% of screen height
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>(['historical', 'pub', 'club', 'neighborhood', 'stadium', 'roma-men', 'roma-women']);
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Token Mapbox
  const MAPBOX_TOKEN = 'pk.eyJ1IjoiZnVyaWVyb21hbmUiLCJhIjoiY21lanVmMWVnMDFsdjJrczc2Mm12Y3QyNyJ9.J1I-1msTs5pOeccQAuQ4yg';

  // Luoghi di Roma
  const romaPlaces = [
    // Luoghi storici e monumenti (marker grigi)
    { 
      name: 'Colosseo', 
      coords: [12.4924, 41.8902], 
      type: 'historical', 
      color: '#6B7280',
      description: 'L\'Amphitheatrum Flavium, vero nome del Colosseo, fu costruito dall\'imperatore Vespasiano nel 72 d.C. e inaugurato dal figlio Tito nell\'80 d.C. Questo colosso architettonico, alto 50 metri con quattro ordini di arcate (dorico, ionico, corinzio e composito), poteva ospitare tra 50.000 e 80.000 spettatori. I complessi sotterranei (hypogeum) conservano ancora i meccanismi di elevazione che facevano apparire nell\'arena gladiatori, bestie feroci e scenografie spettacolari. Il nome "Colosseo" deriva dalla colossale statua di Nerone (Colosso di Nerone) che sorgeva nelle vicinanze. Patrimonio UNESCO dal 1980.',
      image: 'https://turismoroma.it/sites/default/files/colosseo_slide_0.jpg'
    },
    { 
      name: 'Pantheon', 
      coords: [12.4768, 41.8986], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Capolavoro assoluto dell\'ingegneria romana, il Pantheon fu ricostruito dall\'imperatore Adriano tra il 112 e il 124 d.C. La sua cupola emisferica in calcestruzzo, con diametro di 43,3 metri, rimane la più grande mai costruita senza armature metalliche. L\'oculo centrale di 9 metri di diametro crea effetti di luce straordinari e funge da "orologio solare" naturale. Originariamente dedicato a tutte le divinità (pan-theon), fu trasformato nella basilica cristiana di Santa Maria ad Martyres nel 609 d.C. Custodisce le tombe del pittore Raffaello Sanzio, dei re Vittorio Emanuele II e Umberto I.',
      image: pantheonImage
    },
    { 
      name: 'Fontana di Trevi', 
      coords: [12.4833, 41.9009], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Opera barocca monumentale progettata da Nicola Salvi e commissionata da Papa Clemente XII nel 1732. Completata trent\'anni dopo da Giuseppe Pannini (Salvi morì nel 1751), misura 26 metri di altezza per 49 di larghezza. Il finanziamento avvenne anche attraverso una tassa sul vino, che fece dire a qualche romano: "Dal vino nasce l\'acqua!". La fontana rappresenta il trionfo di Nettuno (chiamato anche Oceano) con i suoi cavalli marini. L\'Acqua Vergine che l\'alimenta scorre da oltre 2000 anni. Secondo la tradizione, lanciare una moneta assicura il ritorno a Roma - vengono raccolti circa 3000 euro al giorno, devoluti in beneficenza.',
      image: 'https://turismoroma.it/sites/default/files/Fontane%20-%20Fontana%20di%20Trevi_1920x1080mba-07410189%20%C2%A9%20Clickalps%20_%20AGF%20foto.jpg'
    },
    { 
      name: 'Piazza di Spagna', 
      coords: [12.4823, 41.9063], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Cuore pulsante dell\'eleganza romana, Piazza di Spagna incanta con la sua scenografica scalinata di Trinità dei Monti - 135 gradini in travertino progettati da Francesco De Sanctis (1723-1726). Ai piedi, la Fontana della Barcaccia di Pietro Bernini (padre del più famoso Gian Lorenzo) ricorda l\'alluvione del Tevere del 1598. Via dei Condotti, che si apre sulla piazza, è il salotto dello shopping di lusso con le boutique delle più prestigiose maison internazionali. Qui hanno vissuto poeti romantici come Keats e Byron nella Casa-Museo alla base della scalinata.',
      image: piazzaSpagnaImage
    },
    { 
      name: 'Castel Sant\'Angelo', 
      coords: [12.4663, 41.9031], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Nato come Mausoleo di Adriano (139 d.C.), questo cilindro di travertino e peperino è diventato nei secoli fortezza inespugnabile, prigione pontificia e residenza papale rinascimentale. Il Passetto di Borgo, corridoio sopraelevato di 800 metri, lo collegava segretamente al Vaticano per le fughe dei papi in pericolo. Oggi museo con 58 stanze riccamente affrescate, ospita la Sala Paolina, gli appartamenti papali e una terrazza panoramica mozzafiato. La statua bronzea dell\'Arcangelo Michele che corona la fortezza ricorda la visione di Papa Gregorio Magno che nel 590 vide l\'angelo rinfoderare la spada, annunciando la fine della peste.',
      image: 'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=500'
    },
    { 
      name: 'Vittoriano', 
      coords: [12.4828, 41.8956], 
      type: 'historical', 
      color: '#6B7280',
      description: 'Altare della Patria dedicato a Vittorio Emanuele II, primo re d\'Italia unita. Inaugurato nel 1935, è soprannominato "Macchina da scrivere" dai romani. Ospita il Milite Ignoto, il Museo del Risorgimento e terrazze panoramiche con ascensori panoramici che offrono vista a 360° su Roma.',
      image: vitorianoImage
    },
    {
      name: 'Basilica di San Pietro',
      coords: [12.4534, 41.9022],
      type: 'historical',
      color: '#6B7280',
      description: 'La più grande basilica del mondo cristiano, capolavoro del Rinascimento e Barocco. Progettata da Bramante, Michelangelo e Bernini. La cupola di Michelangelo domina Roma con i suoi 136 metri di altezza.',
      image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500'
    },
    {
      name: 'Fori Imperiali',
      coords: [12.4843, 41.8947],
      type: 'historical',
      color: '#6B7280',
      description: 'Complesso di piazze monumentali costruite tra il 46 a.C. e il 113 d.C. dai vari imperatori romani. Include il Foro di Cesare, di Augusto, di Nerva e di Traiano con la famosa Colonna Traiana.',
      image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=500'
    },
    {
      name: 'Villa Borghese',
      coords: [12.4922, 41.9142],
      type: 'historical',
      color: '#6B7280',
      description: 'Magnifico parco di 80 ettari nel cuore di Roma, creato all\'inizio del XVII secolo dal Cardinale Scipione Borghese, nipote di Papa Paolo V. Progettato da Flaminio Ponzio e Giovanni Vasanzio, ospita la celebre Galleria Borghese con capolavori assoluti di Gian Lorenzo Bernini (Apollo e Dafne, Ratto di Proserpina), Caravaggio (Ragazzo con canestro di frutta, San Girolamo), Tiziano e Raffaello. Il parco include anche il Bioparco (zoo storico), il Museo Etrusco di Villa Giulia, il Globe Theatre shakespeariano, il laghetto delle tartarughe e il Pincio con terrazze panoramiche mozzafiato su Roma e San Pietro.',
      image: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500'
    },
    {
      name: 'Terme di Caracalla',
      coords: [12.4907, 41.8784],
      type: 'historical',
      color: '#6B7280',
      description: 'Uno dei più grandi e meglio conservati complessi termali dell\'antica Roma, costruito dall\'imperatore Caracalla tra il 212 e il 216 d.C. Poteva ospitare fino a 1600 bagnanti contemporaneamente.',
      image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500'
    },
    {
      name: 'Circo Massimo',
      coords: [12.4854, 41.8857],
      type: 'historical',
      color: '#6B7280',
      description: 'Il più grande stadio dell\'antichità, lungo 621 metri e largo 118, poteva ospitare fino a 250.000 spettatori per le corse dei carri. Oggi è un parco pubblico che conserva la forma originale.',
      image: 'https://images.unsplash.com/photo-1588773163068-ca4ae4a08742?w=500'
    },
    {
      name: 'Campo de\' Fiori',
      coords: [12.4728, 41.8957],
      type: 'neighborhood',
      color: '#16A34A',
      description: 'Piazza storica con mercato mattutino dal 1869 e vivace vita notturna. Al centro la statua di Giordano Bruno, bruciato qui nel 1600. Circondata da osterie tradizionali e locali trendy.',
      image: 'https://images.unsplash.com/photo-1582719471274-15abce5b07c3?w=500'
    },
    
    // Pub e Bar (marker blu)
    { 
      name: 'Ma Che Siete Venuti a Fà', 
      coords: [12.4692, 41.8896], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Storica birreria artigianale nel cuore di Trastevere, famosa per le birre craft e l\'atmosfera autentica.',
      image: barRomanoImage
    },
    { 
      name: 'Antico Caffè Greco', 
      coords: [12.4823, 41.9058], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Il più antico caffè di Roma (1760), frequentato da D\'Annunzio, Casanova, Nietzsche e Pasolini. La più grande galleria d\'arte aperta al pubblico.',
      image: barRomanoImage
    },
    { 
      name: 'Caffè Sant\'Eustachio', 
      coords: [12.4751, 41.8986], 
      type: 'pub', 
      color: '#2563EB',
      description: 'Antica torrefazione a legna nata nel 1938, uno dei caffè più amati di Roma in Piazza Sant\'Eustachio.',
      image: barRomanoImage
    },
    {
      name: 'Open Baladin',
      coords: [12.4728, 41.8957],
      type: 'pub',
      color: '#2563EB',
      description: 'Pub moderno vicino Campo de\' Fiori, leader nella scena craft-beer romana con 40 birre alla spina e 100 in bottiglia.',
      image: 'https://lp-cms-production.imgix.net/2024-03/courtesy-rome-Open-Baladin-01.jpeg'
    },
    {
      name: 'Ai Tre Scalini',
      coords: [12.4856, 41.8956],
      type: 'pub',
      color: '#2563EB',
      description: 'Antica vineria dal 1895 nel rione Monti. Storica bottiglieria con motto "morire sì, ma non di sete!"',
      image: 'https://www.aitrescalini.org/wp-content/uploads/2024/03/Immagine-WhatsApp-2024-03-07-ore-10.29.26_317756ac.jpg'
    },
    {
      name: 'Cul de Sac',
      coords: [12.4734, 41.8994],
      type: 'pub',
      color: '#2563EB',
      description: 'Wine bar popolare vicino Piazza Navona con terrazza e interno rivestito di bottiglie. Lista enciclopedica di vini regionali italiani.',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500'
    },
    {
      name: 'The Basement',
      coords: [12.4815, 41.9021],
      type: 'pub',
      color: '#2563EB',
      description: 'Pub e cocktail bar con punteggio perfetto su TripAdvisor. Ampia scelta di birre artigianali e cocktail creativi.',
      image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500'
    },
    {
      name: 'Nag\'s Head',
      coords: [12.4789, 41.9012],
      type: 'pub',
      color: '#2563EB',
      description: 'Scottish pub nel cuore di Roma, autentico gusto scozzese con atmosfera tradizionale.',
      image: 'https://nagshead.it/wp-content/uploads/2019/02/slide-scozia.jpg'
    },
    
    // Club e Vita Notturna (marker rosa)
    { 
      name: 'Goa Club', 
      coords: [12.5123, 41.8623], 
      type: 'club', 
      color: '#EC4899',
      description: 'Club iconico di Roma con musica elettronica, frequentato da DJ internazionali e giovani romani.',
      image: clubNotturnoImage
    },
    {
      name: 'Room 26',
      coords: [12.4712, 41.8934],
      type: 'club',
      color: '#EC4899',
      description: 'Discoteca esclusiva nel centro di Roma, locale trendy per la nightlife romana di alto livello.',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500'
    },
    {
      name: 'Ex Dogana',
      coords: [12.4923, 41.8789],
      type: 'club',
      color: '#EC4899',
      description: 'Spazio multifunzionale per eventi, concerti e serate danzanti nella zona San Lorenzo.',
      image: 'https://images.unsplash.com/photo-1574391884720-bfdb9d9d7b84?w=500'
    },
    {
      name: 'Akab Club',
      coords: [12.4856, 41.8745],
      type: 'club',
      color: '#EC4899',
      description: 'Storico club romano con musica house e techno, punto di riferimento per la scena underground.',
      image: 'https://images.unsplash.com/photo-1571166477815-3a379d3e6a24?w=500'
    },
    {
      name: 'Magnolia Roma',
      coords: [12.4547, 41.9342],
      type: 'club',
      color: '#EC4899',
      description: 'Locale al Foro Italico per eventi e serate esclusive, cocktail bar e privée.',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500'
    },
    
    // Quartieri storici e moderni (marker verdi)
    { 
      name: 'Trastevere', 
      coords: [12.4692, 41.8896], 
      type: 'neighborhood', 
      color: '#16A34A',
      description: 'Il Rione XIII, il più esteso di Roma, conserva l\'anima autentica della città eterna. "Trans Tiberim" (oltre il Tevere) era anticamente il quartiere operaio e popolare che ha ispirato poeti come Giuseppe Gioachino Belli e Carlo Alberto Salustri (Trilussa). Le stradine di sampietrini conducono a Santa Maria in Trastevere (XII secolo) con i suoi mosaici dorati medievali. Di sera si trasforma nel cuore pulsante della movida romana: osteriacce che servono vino dei Castelli, trattorie dove "sora Lella" prepara ancora carbonara e amatriciana come una volta, locali aperti fino all\'alba frequentati da romani doc e turisti internazionali.',
      image: trastevereImage
    },
    { 
      name: 'Monti', 
      coords: [12.4856, 41.8956], 
      type: 'neighborhood', 
      color: '#16A34A',
      description: 'Il rione bohémien per eccellenza, che mantiene l\'anima popolare di una volta mescolata a un\'eleganza sottile e ricercata. Via del Boschetto e Via dei Cappuccini ospitano boutique vintage uniche, atelier di artisti emergenti, concept store e librerie indipendenti. I ristoranti di Monti spaziano dalla cucina tradizionale romana alle fusion più creative, mentre i cocktail bar nascosti nei vicoli offrono mixology d\'autore. La sera, Monti si anima di una folla giovane e internazionale che popola i locali fino a tarda notte, creando un\'atmosfera elettrizzante ma mai chiassosa.',
      image: quartiereStoricoImage
    },
    {
      name: 'Testaccio',
      coords: [12.4759, 41.8742],
      type: 'neighborhood',
      color: '#16A34A',
      description: 'Quartiere operaio tradizionale, famoso per la vita notturna e la cucina tipica romana. Ex mattatoio ora centro culturale.',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=500'
    },
    {
      name: 'San Lorenzo',
      coords: [12.5145, 41.9012],
      type: 'neighborhood',
      color: '#16A34A',
      description: 'Quartiere universitario e alternativo, ricco di locali notturni, street art e atmosfera bohémien.',
      image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=500'
    },
    {
      name: 'Pigneto',
      coords: [12.5234, 41.8934],
      type: 'neighborhood',
      color: '#16A34A',
      description: 'Quartiere emergente con gallerie d\'arte indipendenti, wine bar alternativi e forte identità culturale.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'
    },
    {
      name: 'Garbatella',
      coords: [12.4823, 41.8567],
      type: 'neighborhood',
      color: '#16A34A',
      description: 'Quartiere degli anni \'20 con architettura razionalista e case popolari. Atmosfera autentica e cinema famosi.',
      image: 'https://images.unsplash.com/photo-1595950823406-7caba1a27e3a?w=500'
    },
    {
      name: 'Aventino',
      coords: [12.4834, 41.8812],
      type: 'neighborhood',
      color: '#16A34A',
      description: 'Colle aristocratico con ville eleganti, giardini panoramici e il famoso buco della serratura dei Cavalieri di Malta.',
      image: 'https://images.unsplash.com/photo-1587149185119-0d36c3b4b23c?w=500'
    },
    
    // Stadi e Impianti Sportivi (marker arancioni scuri)
    { 
      name: 'Stadio Olimpico', 
      coords: [12.4547, 41.9342], 
      type: 'stadium', 
      color: '#D97706',
      description: 'Tempio del calcio capitolino con capienza di 70.634 spettatori, inaugurato nel 1927 e ristrutturato per i Mondiali di Italia \'90. Situato nel Foro Italico, è la casa di AS Roma e SS Lazio, teatro dei derby più accesi d\'Italia che dividono la città in due. La Curva Sud giallorossa e la Curva Nord biancoceleste creano un\'atmosfera elettrizzante durante le partite. Ha ospitato le Olimpiadi del 1960, la finale dei Mondiali 1990 (Germania Ovest-Argentina), due finali di Champions League (1996, 2009) e concerti memorabili di artisti internazionali. Proprietà del CONI, è considerato uno degli stadi più belli e suggestivi d\'Europa.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'
    },
    {
      name: 'Stadio Flaminio',
      coords: [12.4678, 41.9234],
      type: 'stadium',
      color: '#D97706',
      description: 'Stadio storico progettato da Pier Luigi Nervi per le Olimpiadi del 1960, ex casa della Roma e ora utilizzato per rugby.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
    },
    {
      name: 'Centro Sportivo Fulvio Bernardini',
      coords: [12.3456, 41.8234],
      type: 'stadium',
      color: '#D97706',
      description: 'Centro di allenamento dell\'AS Roma a Trigoria, dotato di campi all\'avanguardia e strutture moderne.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'
    },
    {
      name: 'Ippodromo delle Capannelle',
      coords: [12.5789, 41.8345],
      type: 'stadium',
      color: '#D97706',
      description: 'Storico ippodromo romano inaugurato nel 1926, sede delle più importanti corse di cavalli in Italia.',
      image: 'https://images.unsplash.com/photo-1553103464-e8e2d0c7e52a?w=500'
    },
    {
      name: 'Palazetto dello Sport',
      coords: [12.4612, 41.9289],
      type: 'stadium',
      color: '#D97706',
      description: 'Palazzo dello sport progettato da Pierluigi Nervi per le Olimpiadi 1960, capolavoro architettonico moderno.',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500'
    },
    {
      name: 'Centro Federale di Pietralata',
      coords: [12.5123, 41.9234],
      type: 'stadium',
      color: '#D97706',
      description: 'Centro tecnico federale per il calcio italiano, sede di allenamenti e corsi per allenatori.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'
    },
    {
      name: 'Circolo del Golf Roma Acquasanta',
      coords: [12.5234, 41.8567],
      type: 'stadium',
      color: '#D97706',
      description: 'Prestigioso circolo di golf fondato nel 1903, uno dei più antichi d\'Italia con percorso a 18 buche.',
      image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=500'
    },
    {
      name: 'Centro Olimpico Matteo Pellicone',
      coords: [12.4789, 41.9456],
      type: 'stadium',
      color: '#D97706',
      description: 'Centro di allenamento per lotta e arti marziali, intitolato al campione olimpico Matteo Pellicone.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
    },
    
    // Locali per vedere partite Roma maschile (marker rossi)
    { 
      name: 'Bar del Fico', 
      coords: [12.4735, 41.9008], 
      type: 'roma-men', 
      color: '#DC2626',
      description: 'Bar storico nel centro di Roma, punto di ritrovo dei tifosi giallorossi per le partite.',
      image: barRomanoImage
    },
    {
      name: 'The Highlander Scottish Pub',
      coords: [12.4823, 41.9034],
      type: 'roma-men',
      color: '#DC2626',
      description: 'Storico pub scozzese nel cuore di Roma, aperto 365 giorni all\'anno. Punto di riferimento per vedere tutte le partite della Roma su maxischermi, con atmosfera autentica da pub e ottima selezione di birre. "There can be only one" dove non berrai mai da solo.',
      image: barRomanoImage
    },
    {
      name: 'Akab Club',
      coords: [12.4856, 41.8745],
      type: 'club',
      color: '#EC4899',
      description: 'Storico club di Testaccio, punto fisso della nightlife romana da anni. Famoso per la qualità dell\'intrattenimento dal vivo e per i DJ set di musica elettronica. Una delle discoteche più popolari e longeve di Roma, frequentata da giovani romani e internazionali.',
      image: clubNotturnoImage
    },
    {
      name: 'The Drunken Ship',
      coords: [12.4728, 41.8957],
      type: 'roma-men',
      color: '#DC2626',
      description: 'Pub americano a Campo de\' Fiori, popolare tra i tifosi per vedere le partite su grandi schermi.',
      image: 'https://images.unsplash.com/photo-1541696490-8275fd5f6144?w=500'
    },
    {
      name: 'Yellow Bar',
      coords: [12.4756, 41.8945],
      type: 'roma-men',
      color: '#DC2626',
      description: 'Sports bar con ambiente giallorosso, frequentato dai tifosi della Roma per seguire le partite.',
      image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=500'
    },
    {
      name: 'Libreria del Viaggiatore',
      coords: [12.4692, 41.8896],
      type: 'roma-men',
      color: '#DC2626',
      description: 'Bar libreria a Trastevere che trasmette le partite della Roma in ambiente culturale e rilassato.',
      image: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=500'
    },
    
    // Locali Roma femminile (marker viola/magenta)
    { 
      name: 'Centro Sportivo Bernardini', 
      coords: [12.4234, 41.8456], 
      type: 'roma-women', 
      color: '#9333EA',
      description: 'Centro di allenamento dell\'AS Roma Femminile, sede degli allenamenti e delle partite casalinghe.',
      image: 'https://cdn.pixabay.com/photo/2016/02/13/12/26/aurora-1197753_1280.jpg'
    },
    {
      name: 'Tre Fontane Sports Center',
      coords: [12.4123, 41.8345],
      type: 'roma-women',
      color: '#9333EA',
      description: 'Centro sportivo dove si allenano e giocano le squadre giovanili femminili della Roma.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'
    },
    {
      name: 'Bar dello Sport Femminile',
      coords: [12.4567, 41.8765],
      type: 'roma-women',
      color: '#9333EA',
      description: 'Bar dedicato al calcio femminile, trasmette le partite della Roma Women e promuove lo sport femminile.',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500'
    },
    
    // Altri luoghi iconici
    {
      name: 'Isola Tiberina',
      coords: [12.4775, 41.8906],
      type: 'historical',
      color: '#6B7280',
      description: 'Isola sul Tevere a forma di nave, collegata alla città da due ponti antichi. Sede dell\'Ospedale Fatebenefratelli.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'
    },
    {
      name: 'Ponte Sant\'Angelo',
      coords: [12.4668, 41.9021],
      type: 'historical',
      color: '#6B7280',
      description: 'Ponte romano decorato da 10 statue di angeli del Bernini, collega il centro storico a Castel Sant\'Angelo.',
      image: 'https://images.unsplash.com/photo-1580800503000-7b8c86c1a532?w=500'
    },
    {
      name: 'Mercati di Traiano',
      coords: [12.4856, 41.8956],
      type: 'historical',
      color: '#6B7280',
      description: 'Complesso commerciale antico considerato il primo centro commerciale della storia, oggi museo.',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73136?w=500'
    },
    {
      name: 'Domus Aurea',
      coords: [12.4967, 41.8923],
      type: 'historical',
      color: '#6B7280',
      description: 'Villa dorata di Nerone, palazzo imperiale con decorazioni e tecnologie avanzatissime per l\'epoca.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'
    },
    {
      name: 'Palazzo Altemps',
      coords: [12.4734, 41.9012],
      type: 'historical',
      color: '#6B7280',
      description: 'Palazzo rinascimentale che ospita una delle più importanti collezioni di sculture antiche al mondo.',
      image: 'https://images.unsplash.com/photo-1587149185119-0d36c3b4b23c?w=500'
    },
    {
      name: 'Palazzo Massimo',
      coords: [12.4998, 41.9023],
      type: 'historical',
      color: '#6B7280',
      description: 'Sede del Museo Nazionale Romano con capolavori dell\'arte antica, affreschi e mosaici straordinari.',
      image: 'https://images.unsplash.com/photo-1595950823406-7caba1a27e3a?w=500'
    },

    // Nuovi impianti sportivi da Wikipedia
    {
      name: 'Centro sportivo La Borghesiana',
      coords: [12.6234, 41.8345],
      type: 'stadium',
      color: '#D97706',
      description: 'Centro sportivo moderno nella zona est di Roma, utilizzato per allenamenti e competizioni locali.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'
    },
    {
      name: 'Centro Federale Polo Acquatico di Ostia',
      coords: [12.2890, 41.7456],
      type: 'stadium',
      color: '#D97706',
      description: 'Centro federale specializzato nel polo acquatico, situato nel litorale di Ostia.',
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500'
    },
    {
      name: 'Circolo Antico tiro a volo',
      coords: [12.4789, 41.9456],
      type: 'stadium',
      color: '#D97706',
      description: 'Storico circolo per il tiro a volo, uno dei più antichi impianti sportivi di Roma.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
    },
    {
      name: 'Circolo del Tennis del Foro Italico',
      coords: [12.4578, 41.9345],
      type: 'stadium',
      color: '#D97706',
      description: 'Prestigioso circolo tennistico del Foro Italico, sede degli Internazionali d\'Italia.',
      image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500'
    },
    {
      name: 'Città dello sport',
      coords: [12.4234, 41.8567],
      type: 'stadium',
      color: '#D97706',
      description: 'Moderno complesso sportivo multifunzionale nella zona sud di Roma.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
    },
    {
      name: 'Accademia di scherma al Foro Italico',
      coords: [12.4567, 41.9323],
      type: 'stadium',
      color: '#D97706',
      description: 'Accademia nazionale di scherma, punto di riferimento per questo sport in Italia.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
    },
    {
      name: 'Complesso natatorio del Foro Italico',
      coords: [12.4556, 41.9334],
      type: 'stadium',
      color: '#D97706',
      description: 'Complesso di piscine olimpiche del Foro Italico, sede di gare internazionali di nuoto.',
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500'
    },
    {
      name: 'Stadio dei Marmi Pietro Mennea',
      coords: [12.4545, 41.9312],
      type: 'stadium',
      color: '#D97706',
      description: 'Stadio di atletica decorato con statue di marmo, intitolato al velocista Pietro Mennea.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
    },
    {
      name: 'Motovelodromo Appio',
      coords: [12.5123, 41.8789],
      type: 'stadium',
      color: '#D97706',
      description: 'Storico impianto per corse motociclistiche e ciclismo su pista nella zona Appio.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
    },
    {
      name: 'Centro di preparazione olimpica Giulio Onesti',
      coords: [12.5234, 41.9234],
      type: 'stadium',
      color: '#D97706',
      description: 'Centro di preparazione per atleti olimpici, intitolato al dirigente sportivo Giulio Onesti.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
    },
    {
      name: 'Palazzo dello Sport (Roma)',
      coords: [12.5167, 41.9456],
      type: 'stadium',
      color: '#D97706',
      description: 'Grande palazzo dello sport per eventi indoor, concerti e manifestazioni sportive.',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500'
    },
    {
      name: 'Piscina delle Rose',
      coords: [12.5089, 41.9123],
      type: 'stadium',
      color: '#D97706',
      description: 'Piscina storica di Roma, punto di riferimento per il nuoto cittadino.',
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500'
    },
    {
      name: 'Poligono Olimpico (Roma)',
      coords: [12.4678, 41.9456],
      type: 'stadium',
      color: '#D97706',
      description: 'Poligono di tiro olimpico, sede di competizioni nazionali e internazionali.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500'
    },
    {
      name: 'Stadio della Rondinella',
      coords: [12.4345, 41.8678],
      type: 'stadium',
      color: '#D97706',
      description: 'Stadio di calcio della zona sud di Roma, casa di squadre minori locali.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'
    },
    {
      name: 'Grand Stand Arena',
      coords: [12.4589, 41.9345],
      type: 'stadium',
      color: '#D97706',
      description: 'Arena moderna nel complesso del Foro Italico per eventi sportivi e spettacoli.',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500'
    },
    {
      name: 'Stadio Centrale del Tennis',
      coords: [12.4567, 41.9334],
      type: 'stadium',
      color: '#D97706',
      description: 'Campo centrale del tennis del Foro Italico, sede della finale degli Internazionali.',
      image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500'
    },
    {
      name: 'Stadio Nicola Pietrangeli',
      coords: [12.4578, 41.9323],
      type: 'stadium',
      color: '#D97706',
      description: 'Secondo campo più importante del tennis romano, intitolato al tennista Nicola Pietrangeli.',
      image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500'
    },
    {
      name: 'SuperTennis Arena',
      coords: [12.4556, 41.9312],
      type: 'stadium',
      color: '#D97706',
      description: 'Arena moderna per il tennis con tecnologie all\'avanguardia nel Foro Italico.',
      image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500'
    },
    {
      name: 'Campo Testaccio',
      coords: [12.4756, 41.8742],
      type: 'stadium',
      color: '#D97706',
      description: 'Storico campo di calcio nel quartiere Testaccio, primo stadio dell\'AS Roma.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'
    },
    {
      name: 'Ippodromo Tor di Valle',
      coords: [12.4123, 41.8234],
      type: 'stadium',
      color: '#D97706',
      description: 'Storico ippodromo nella zona sud di Roma, sede di corse di galoppo e trotto.',
      image: 'https://images.unsplash.com/photo-1553103464-e8e2d0c7e52a?w=500'
    },
    {
      name: 'Trastevere Stadium',
      coords: [12.4634, 41.8823],
      type: 'stadium',
      color: '#D97706',
      description: 'Stadio nel quartiere Trastevere per calcio e eventi sportivi locali.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'
    },
    {
      name: 'Stadio Tre Fontane',
      coords: [12.4089, 41.8345],
      type: 'stadium',
      color: '#D97706',
      description: 'Stadio nella zona delle Tre Fontane, utilizzato per calcio e atletica leggera.',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500'
    },
    {
      name: 'Velodromo Olimpico',
      coords: [12.4645, 41.9389],
      type: 'stadium',
      color: '#D97706',
      description: 'Velodromo storico per ciclismo su pista, parte del complesso olimpico romano.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'
    },

    // Nuovi monumenti e attrazioni da ScopriRoma
    {
      name: 'Palatino',
      coords: [12.4883, 41.8887],
      type: 'historical',
      color: '#6B7280',
      description: 'Il Monte Palatino è il più centrale dei sette colli di Roma ed è una delle zone più antiche della città.',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73136?w=500'
    },
    {
      name: 'Colonna Traiana',
      coords: [12.4843, 41.8958],
      type: 'historical',
      color: '#6B7280',
      description: 'Costruita su ordine dell\'imperatore Traiano nell\'anno 114, è uno dei monumenti più importanti nel cuore di Roma.',
      image: 'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=500'
    },
    {
      name: 'Catacombe di San Callisto',
      coords: [12.5123, 41.8567],
      type: 'historical',
      color: '#6B7280',
      description: 'Le catacombe sono gallerie sotterranee che furono utilizzate per vari secoli come luoghi di sepoltura.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'
    },
    {
      name: 'Arco di Costantino',
      coords: [12.4906, 41.8896],
      type: 'historical',
      color: '#6B7280',
      description: 'L\'Arco di Costantino si trova fra il Colosseo e il Monte Palatino e fu costruito nel 315 per commemorare la vittoria di Ponte Milvio.',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73136?w=500'
    },
    {
      name: 'Ara Pacis',
      coords: [12.4756, 41.9067],
      type: 'historical',
      color: '#6B7280',
      description: 'L\'Ara Pacis è un monumento commemorativo eretto fra il 13 e il 9 a.C. per celebrare la pace nel Mediterraneo.',
      image: 'https://images.unsplash.com/photo-1587149185119-0d36c3b4b23c?w=500'
    },
    {
      name: 'Bocca della Verità',
      coords: [12.4817, 41.8878],
      type: 'historical',
      color: '#6B7280',
      description: 'La Bocca della Verità è una grande maschera di marmo, la cui leggenda narra che potrebbe mordere la mano di chiunque la inserisca nella sua bocca.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'
    },
    {
      name: 'Gianicolo',
      coords: [12.4623, 41.8934],
      type: 'historical',
      color: '#6B7280',
      description: 'Il Gianicolo è un luogo gradevole dove passeggiare, per poi visitare nella zona dei punti d\'interesse interessanti come la Chiesa di San Pietro in Montorio.',
      image: 'https://images.unsplash.com/photo-1580800503000-7b8c86c1a532?w=500'
    },
    {
      name: 'Area Sacra di Largo Argentina',
      coords: [12.4756, 41.8956],
      type: 'historical',
      color: '#6B7280',
      description: 'L\'Area Sacra è la zona dove si trovano le rovine dei templi più antichi di Roma. Attualmente l\'area è occupata da rovine e da centinaia di gatti.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500'
    },
    {
      name: 'Forum Boarium',
      coords: [12.4823, 41.8887],
      type: 'historical',
      color: '#6B7280',
      description: 'Il Forum Boarium è una zona che costeggia il Tevere, dove si conservano in buone condizioni i templi repubblicani costruiti nel II secolo a.C.',
      image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73136?w=500'
    },

    // Nuovi club da Xceed
    {
      name: 'Spazio Novecento',
      coords: [12.4789, 41.8956],
      type: 'club',
      color: '#EC4899',
      description: 'Uno dei club più esclusivi e innovativi di Roma, famoso per le serate techno e house di qualità.',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500'
    },
    {
      name: 'MONK Roma',
      coords: [12.4823, 41.9012],
      type: 'club',
      color: '#EC4899',
      description: 'Club moderno nel centro di Roma, noto per la sua programmazione musicale raffinata e l\'atmosfera elegante.',
      image: 'https://images.unsplash.com/photo-1571166477815-3a379d3e6a24?w=500'
    },
    {
      name: 'The Sanctuary Eco Retreat',
      coords: [12.3456, 41.8234],
      type: 'club',
      color: '#EC4899',
      description: 'Locale unico che combina sostenibilità ambientale e vita notturna, situato in zona periferica.',
      image: 'https://images.unsplash.com/photo-1574391884720-bfdb9d9d7b84?w=500'
    },
    {
      name: 'Cave di Tufo di Tor Cervara',
      coords: [12.5567, 41.9123],
      type: 'club',
      color: '#EC4899',
      description: 'Location suggestiva nelle antiche cave di tufo, per eventi underground e serate alternative.',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500'
    },
    {
      name: 'Cieloterra',
      coords: [12.4567, 41.8789],
      type: 'club',
      color: '#EC4899',
      description: 'Club all\'aperto con giardino, perfetto per serate estive e eventi musicali sotto le stelle.',
      image: 'https://images.unsplash.com/photo-1574391884720-bfdb9d9d7b84?w=500'
    },
    {
      name: 'NICE Disco',
      coords: [12.4712, 41.8945],
      type: 'club',
      color: '#EC4899',
      description: 'Discoteca moderna con pista da ballo spaziosa e sistema audio di alta qualità.',
      image: 'https://images.unsplash.com/photo-1571166477815-3a379d3e6a24?w=500'
    },
    {
      name: 'Opus Club',
      coords: [12.4834, 41.9023],
      type: 'club',
      color: '#EC4899',
      description: 'Club esclusivo nel centro di Roma, frequentato da personaggi del mondo dello spettacolo.',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500'
    },
    {
      name: 'Atlantico Live',
      coords: [12.4689, 41.8956],
      type: 'club',
      color: '#EC4899',
      description: 'Locale per concerti live e DJ set, con palco per artisti emergenti e internazionali.',
      image: 'https://images.unsplash.com/photo-1574391884720-bfdb9d9d7b84?w=500'
    },
    {
      name: 'Alcazar',
      coords: [12.4756, 41.8923],
      type: 'club',
      color: '#EC4899',
      description: 'Discoteca storica di Roma con sale multiple e diversi generi musicali.',
      image: 'https://images.unsplash.com/photo-1571166477815-3a379d3e6a24?w=500'
    },
    {
      name: 'Secret Location Roma',
      coords: [12.4645, 41.8834],
      type: 'club',
      color: '#EC4899',
      description: 'Club misterioso che cambia location, noto per eventi esclusivi e feste private.',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500'
    },
    {
      name: 'Materia Club',
      coords: [12.5123, 41.8967],
      type: 'club',
      color: '#EC4899',
      description: 'Club underground specializzato in musica techno e elettronica sperimentale.',
      image: 'https://images.unsplash.com/photo-1571166477815-3a379d3e6a24?w=500'
    },
    {
      name: 'Ground Zero',
      coords: [12.4889, 41.8745],
      type: 'club',
      color: '#EC4899',
      description: 'Locale alternativo per eventi underground, concerti punk e metal.',
      image: 'https://images.unsplash.com/photo-1574391884720-bfdb9d9d7b84?w=500'
    },
    {
      name: 'Andrea Doria Club',
      coords: [12.4567, 41.9067],
      type: 'club',
      color: '#EC4899',
      description: 'Club nautico che organizza anche eventi serali e feste a tema marinaresco.',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500'
    },
    {
      name: 'THE RANDOM',
      coords: [12.4723, 41.8867],
      type: 'club',
      color: '#EC4899',
      description: 'Club con programmazione musicale varia e imprevedibile, da qui il nome "Random".',
      image: 'https://images.unsplash.com/photo-1571166477815-3a379d3e6a24?w=500'
    },
    {
      name: '692 Secret Garden',
      coords: [12.4634, 41.8923],
      type: 'club',
      color: '#EC4899',
      description: 'Club con giardino segreto, atmosfera intima e selezione musicale ricercata.',
      image: 'https://images.unsplash.com/photo-1574391884720-bfdb9d9d7b84?w=500'
    },
    {
      name: 'Aforisma & Toy Room',
      coords: [12.4789, 41.9034],
      type: 'club',
      color: '#EC4899',
      description: 'Doppio locale con due ambienti diversi: uno più rilassato e uno per il clubbing.',
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500'
    }
  ];

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'historical': return 'Luogo Storico';
      case 'pub': return 'Pub & Bar';
      case 'club': return 'Club & Vita Notturna';
      case 'neighborhood': return 'Quartiere';
      case 'stadium': return 'Stadio';
      case 'roma-men': return 'Partite Roma';
      case 'roma-women': return 'Roma Femminile';
      case 'other': return 'Punto di Interesse';
      default: return 'Luogo';
    }
  };

  const toggleFilter = (type: string) => {
    // Exclusive selection: show only selected type
    setActiveFilters([type]);
  };

  const showAllFilters = () => {
    setActiveFilters(['historical', 'pub', 'club', 'neighborhood', 'stadium', 'roma-men', 'roma-women']);
  };

  const getFilteredPlaces = () => {
    return romaPlaces.filter(place => activeFilters.includes(place.type));
  };

  const getPlaceCount = (type: string) => {
    return romaPlaces.filter(place => place.type === type).length;
  };

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) {
      console.log('❌ Map container not found');
      return;
    }
    
    console.log('🗺️ Initializing map, isMobile:', isMobile);
    
    // Set token
    mapboxgl.accessToken = MAPBOX_TOKEN;
    console.log('🔑 Mapbox token set');
    
    // Create map with mobile-optimized settings
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [12.4964, 41.9028],
      zoom: isMobile ? 11 : 12, // Lower zoom for mobile
      pitch: isMobile ? 0 : 45, // No pitch on mobile for better performance
      antialias: !isMobile, // Disable antialiasing on mobile
      preserveDrawingBuffer: false, // Better performance
      renderWorldCopies: false, // Better performance
      maxZoom: isMobile ? 16 : 18, // Limit zoom on mobile
    });

    console.log('🗺️ Map instance created');

    // Add navigation controls only on desktop
    if (!isMobile) {
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
      console.log('🧭 Navigation controls added');
    }

    // Wait for map to load before adding markers
    mapInstance.on('load', () => {
      console.log('✅ Map loaded successfully');
      setIsMapLoading(false);
      
      // Add markers for filtered places
      updateMarkers(mapInstance);
    });

    mapInstance.on('error', (e) => {
      console.error('❌ Map error:', e);
    });

    mapInstance.on('sourcedata', (e) => {
      if (e.isSourceLoaded) {
        console.log('📊 Map source loaded:', e.sourceId);
      }
    });

    map.current = mapInstance;

    return () => {
      console.log('🧹 Cleaning up map');
      setIsMapLoading(true);
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [isMobile]); // Add isMobile as dependency

  // Update markers when filters change
  useEffect(() => {
    if (map.current && !isMapLoading) {
      updateMarkers(map.current);
    }
  }, [activeFilters, isMobile]);

  const updateMarkers = (mapInstance: mapboxgl.Map) => {
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Get filtered places
    const filteredPlaces = getFilteredPlaces();
    const placesToShow = isMobile ? filteredPlaces.slice(0, 25) : filteredPlaces;
    console.log(`📍 Adding ${placesToShow.length} filtered markers`);
    
    // Add markers for filtered places
    placesToShow.forEach((place, index) => {
      try {
        const markerEl = document.createElement('div');
        markerEl.className = 'custom-marker';
        markerEl.style.cssText = `
          background-color: ${place.color};
          width: ${isMobile ? '16px' : '20px'};
          height: ${isMobile ? '16px' : '20px'};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 2px solid white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        `;

        markerEl.addEventListener('click', (e) => {
          e.stopPropagation();
          console.log('📍 Marker clicked:', place.name);
          setSelectedPlace(place);
          if (isMobile) {
            setIsDrawerOpen(true);
          }
        });

        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat(place.coords as [number, number])
          .addTo(mapInstance);
          
        markers.current.push(marker);
          
        if (index === 0) console.log('✅ First filtered marker added successfully');
      } catch (error) {
        console.error('❌ Error adding marker:', place.name, error);
      }
    });

    // Add fog effect only on desktop
    if (!isMobile) {
      try {
        mapInstance.setFog({
          color: 'rgb(255, 255, 255)',
          'high-color': 'rgb(200, 200, 225)',
          'horizon-blend': 0.1,
        });
        console.log('🌫️ Fog effect added');
      } catch (error) {
        console.error('❌ Error adding fog:', error);
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-background">
      {/* Mobile Layout - Square Map */}
      {isMobile ? (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-background/95 backdrop-blur-sm p-3 border-b border-border/50 z-30">
            <h2 className="text-lg font-semibold text-roma-gold text-center">Discover the Eternal City</h2>
          </div>
          
          {/* Square Map Container - Takes half of remaining screen */}
          <div className="relative flex-1 max-h-[50vh]">
            <div 
              ref={mapContainer} 
              className="w-full h-full"
            />
            
            {/* Loading indicator */}
            {isMapLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-30">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-roma-gold mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Caricamento mappa...</p>
                </div>
              </div>
            )}
            
            {/* Floating Legend */}
            <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border/50 max-w-[180px] z-20">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-bold text-roma-gold">Legenda</h4>
                <button
                  onClick={showAllFilters}
                  className="text-[10px] text-roma-gold hover:text-roma-yellow underline"
                >
                  Tutti
                </button>
              </div>
              <div className="space-y-1 text-xs">
                {[
                  { type: 'stadium', color: '#D97706', label: 'Stadi' },
                  { type: 'roma-men', color: '#DC2626', label: 'Roma' },
                  { type: 'roma-women', color: '#9333EA', label: 'Femminile' },
                  { type: 'pub', color: '#2563EB', label: 'Bar' },
                  { type: 'club', color: '#EC4899', label: 'Club' },
                  { type: 'neighborhood', color: '#16A34A', label: 'Quartieri' },
                  { type: 'historical', color: '#6B7280', label: 'Storici' }
                ].map((item) => (
                  <button
                    key={item.type}
                    onClick={() => toggleFilter(item.type)}
                    className={`flex items-center gap-1 w-full p-1 rounded transition-all hover:bg-muted/50 ${
                      activeFilters.includes(item.type) 
                        ? 'opacity-100' 
                        : 'opacity-50 hover:opacity-70'
                    }`}
                  >
                    <div 
                      className="w-2 h-2 rounded-full border border-white flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="truncate text-xs">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      ({getPlaceCount(item.type)})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bottom Drawer Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="w-full bg-background/95 backdrop-blur-sm border-t border-border/50 p-4 flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
            >
              {isDrawerOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              <span className="font-medium">
                {selectedPlace ? selectedPlace.name : 'Luoghi di Roma'}
              </span>
              {isDrawerOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Bottom Drawer */}
          {isDrawerOpen && (
            <div 
              className="bg-background border-t border-border/50 overflow-y-auto transition-all duration-300 ease-in-out"
              style={{ 
                height: selectedPlace ? '40vh' : '25vh',
                maxHeight: '50vh'
              }}
            >
              {selectedPlace ? (
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground">{selectedPlace.name}</h3>
                      <p className="text-sm font-medium" style={{ color: selectedPlace.color }}>
                        {getTypeLabel(selectedPlace.type)}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedPlace(null)}
                      className="p-2 rounded-full hover:bg-muted transition-colors"
                    >
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>
                  
                  {selectedPlace.image && (
                    <img 
                      src={selectedPlace.image} 
                      alt={selectedPlace.name}
                      className="w-full h-40 object-cover rounded-lg mb-4"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {selectedPlace.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedPlace.description}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4">
                  <h3 className="text-lg font-bold text-roma-gold mb-3">Esplora Roma</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'historical', color: '#6B7280', label: 'Luoghi Storici' },
                      { type: 'pub', color: '#2563EB', label: 'Pub & Bar' },
                      { type: 'club', color: '#EC4899', label: 'Club' },
                      { type: 'neighborhood', color: '#16A34A', label: 'Quartieri' },
                      { type: 'stadium', color: '#D97706', label: 'Stadi' },
                      { type: 'roma-men', color: '#DC2626', label: 'Partite Roma' }
                    ].map((item) => (
                      <button
                        key={item.type}
                        onClick={() => toggleFilter(item.type)}
                        className={`flex items-center gap-2 p-2 rounded transition-all hover:bg-muted/50 text-left ${
                          activeFilters.includes(item.type) 
                            ? 'opacity-100' 
                            : 'opacity-50 hover:opacity-70'
                        }`}
                      >
                        <div 
                          className="w-3 h-3 rounded-full border border-white flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm truncate">{item.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Tocca un filtro per mostrare/nascondere i luoghi sulla mappa
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Desktop Layout */
        <div className="container mx-auto px-4 py-8 h-full">
          <h1 className="text-4xl font-bold mb-8 text-roma-gold">
            Mappa di Roma
          </h1>
          
          <div className={`flex gap-4 transition-all duration-300 h-[500px]`}>
            {/* Map Container */}
            <div className={`relative rounded-lg overflow-hidden shadow-roma border border-border/50 transition-all duration-300 ${
              selectedPlace ? 'w-2/3' : 'w-full'
            }`}>
              <div 
                ref={mapContainer} 
                className="w-full h-full"
              />
              
              {/* Legend - Desktop only */}
              <div className="absolute top-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border/50 max-w-[200px] z-10">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-roma-gold">Legenda</h4>
                  <button
                    onClick={showAllFilters}
                    className="text-xs text-roma-gold hover:text-roma-yellow underline"
                  >
                    Tutti
                  </button>
                </div>
                <div className="space-y-1 text-xs">
                  {[
                    { type: 'stadium', color: '#D97706', label: 'Stadi' },
                    { type: 'roma-men', color: '#DC2626', label: 'Partite Roma' },
                    { type: 'roma-women', color: '#9333EA', label: 'Roma Femminile' },
                    { type: 'pub', color: '#2563EB', label: 'Pub & Bar' },
                    { type: 'club', color: '#EC4899', label: 'Club' },
                    { type: 'neighborhood', color: '#16A34A', label: 'Quartieri' },
                    { type: 'historical', color: '#6B7280', label: 'Luoghi Storici' }
                  ].map((item) => (
                    <button
                      key={item.type}
                      onClick={() => toggleFilter(item.type)}
                      className={`flex items-center gap-2 w-full p-1.5 rounded transition-all hover:bg-muted/50 text-left ${
                        activeFilters.includes(item.type) 
                          ? 'opacity-100' 
                          : 'opacity-50 hover:opacity-70'
                      }`}
                    >
                      <div 
                        className="w-3 h-3 rounded-full border border-white flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="truncate text-xs flex-1">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground">
                        ({getPlaceCount(item.type)})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Side Panel */}
            {selectedPlace && (
              <div className="w-1/3 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border/50 flex flex-col">
                <div className="flex justify-between items-start p-4 border-b border-border/50">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">{selectedPlace.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{getTypeLabel(selectedPlace.type)}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedPlace(null)}
                    className="p-1 rounded-full hover:bg-muted transition-colors flex-shrink-0 ml-2"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {selectedPlace.image && (
                    <img 
                      src={selectedPlace.image} 
                      alt={selectedPlace.name}
                      className="w-full h-32 object-cover rounded-md mb-3"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  
                  {selectedPlace.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedPlace.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RomaMap;