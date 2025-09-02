// Centralized list of places for the Roma map
// NOTE: Descriptions are concise summaries authored for this project (no direct copying from source sites).
export interface Place {
  id: string;
  name: string;
  coords: [number, number]; // [lng, lat]
  description: string;
  category?: string;
  image?: string;
}

// Categories legend (suggested colors can be mapped in component):
// Storico, Monumento, Arte, Religioso, Sport, Ritrovo, Natura, Club

export const places: Place[] = [
  {
    id: 'colosseo',
    name: 'Colosseo',
    coords: [12.4922, 41.8902],
    description: 'Anfiteatro simbolo di Roma imperiale e degli spettacoli gladiatori.',
    category: 'Storico',
    image: '/mock/colosseo.jpg'
  },
  {
    id: 'foro_romano',
    name: 'Foro Romano',
    coords: [12.4853, 41.8925],
    description: 'Cuore politico e religioso dell’antica Roma, fra archi e templi.',
    category: 'Storico'
  },
  {
    id: 'pantheon',
    name: 'Pantheon',
    coords: [12.4768, 41.8986],
    description: 'Tempio antico mirabilmente conservato con grande cupola emisferica.',
    category: 'Monumento'
  },
  {
    id: 'fontana_trevi',
    name: 'Fontana di Trevi',
    coords: [12.4833, 41.9009],
    description: 'Scenografica fontana barocca celebre per il lancio della monetina.',
    category: 'Monumento'
  },
  {
    id: 'piazza_navona',
    name: 'Piazza Navona',
    coords: [12.4731, 41.8992],
    description: 'Piazza barocca su antico stadio, fontane e vivace atmosfera.',
    category: 'Ritrovo'
  },
  {
    id: 'piazza_di_spagna',
    name: 'Piazza di Spagna',
    coords: [12.4829, 41.9059],
    description: 'Scala monumentale di Trinità dei Monti e Barcaccia al centro.',
    category: 'Monumento'
  },
  {
    id: 'altare_patria',
    name: 'Altare della Patria',
    coords: [12.4823, 41.8931],
    description: 'Monumento al Milite Ignoto con terrazze panoramiche sulla città.',
    category: 'Monumento'
  },
  {
    id: 'circo_massimo',
    name: 'Circo Massimo',
    coords: [12.4883, 41.8861],
    description: 'Antico ippodromo romano oggi grande spazio aperto per eventi.',
    category: 'Storico'
  },
  {
    id: 'terme_caracalla',
    name: 'Terme di Caracalla',
    coords: [12.4956, 41.8794],
    description: 'Maestoso complesso termale imperiale tra mosaici e rovine.',
    category: 'Storico'
  },
  {
    id: 'galleria_borghese',
    name: 'Galleria Borghese',
    coords: [12.4922, 41.9142],
    description: 'Museo con capolavori di Bernini, Caravaggio e Canova nei giardini.',
    category: 'Arte'
  },
  {
    id: 'san_pietro',
    name: 'Basilica di San Pietro',
    coords: [12.4539, 41.9022],
    description: 'Imponente basilica rinascimentale e fulcro della cristianità.',
    category: 'Religioso'
  },
  {
    id: 'musei_vaticani',
    name: 'Musei Vaticani',
    coords: [12.4533, 41.9065],
    description: 'Collezioni d’arte millenarie culminanti nella Cappella Sistina.',
    category: 'Arte'
  },
  {
    id: 'castel_santangelo',
    name: "Castel Sant'Angelo", 
    coords: [12.4663, 41.9039],
    description: 'Mausoleo divenuto fortezza e museo sulle rive del Tevere.',
    category: 'Storico'
  },
  {
    id: 'stadio_olimpico',
    name: 'Stadio Olimpico',
    coords: [12.4547, 41.9339],
    description: 'Stadio simbolo delle sfide calcistiche e notti europee.',
    category: 'Sport'
  },
  {
    id: 'trigoria',
    name: 'Centro Sportivo Trigoria',
    coords: [12.5756, 41.7803],
    description: 'Sede degli allenamenti e strategia della AS Roma.',
    category: 'Club'
  },
  {
    id: 'piazza_del_popolo',
    name: 'Piazza del Popolo',
    coords: [12.4768, 41.9109],
    description: 'Ampia piazza monumentale e punto di incontro cittadino.',
    category: 'Ritrovo'
  }
];
