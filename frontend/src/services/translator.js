const DICTIONARY = {
  en: {
    // Landing
    'stadiumflow_ai': 'StadiumFlow AI',
    'decision_layer': 'Real-Time Decision Intelligence Layer • FIFA World Cup 2026',
    'spectator_portal': 'Spectator Fan Portal',
    'command_center': 'Command Center',
    'seat_section': 'Seat Section',
    'row': 'Row',
    'seat': 'Seat',
    'arrival_entrance': 'Arrival Entrance',
    'preferred_language': 'Preferred Language',
    'accessibility_mode': 'Accessibility routing mode',
    'accessibility_desc': '(prioritizes elevators & ramps, avoids stairs)',
    'enter_stadium': 'Enter Smart Stadium Map',
    'launch_command': 'Launch Command Center Dashboard',

    // Headers & Common
    'exit': 'Exit',
    'exit_console': 'Exit Console',
    'sync_live': 'Sync Live',
    'active': 'Active',
    'normal': 'Normal',
    'heavy': 'Heavy',
    'overload': 'Overload',
    'closed': 'Closed',
    'normal_ops': 'Normal Operations',
    'incident_mode': 'Active Incident / Warning Mode',

    // Map
    'smart_stadium_map': 'Smart Stadium Map',
    'map_sub_fan': 'Click nodes to set Start Entrance & End Destination',
    'map_sub_op': 'Live network flow & congestion overlay',
    'no_path': 'No path selected. Click map nodes to route.',
    'start_node': 'Start Entrance',
    'dest_node': 'Destination',
    
    // Path Details
    'path_details': 'Calculated Active Path Details',
    'distance': 'Distance',
    'time': 'Time',
    'meters': 'meters',
    'minutes': 'minutes',

    // Facility Explorer
    'facility_explorer': 'Facility Queue Explorer',
    'facility_sub': 'Recommends fastest options based on walking distance + queue wait times.',
    'restrooms': 'Restrooms',
    'foods': 'Food Stalls',
    'medicals': 'Medical Points',
    'infos': 'Info Desks',
    'name': 'Name',
    'walk_time': 'Walk Time',
    'queue_wait': 'Queue Wait',
    'total_est': 'Total Est. Time',
    'actions': 'Actions',
    'route_here': 'Route Here',
    'fastest': 'Fastest',
    'no_facilities': 'No facilities found or accessible.',

    // Feedback Loop
    'feedback_title': 'Spectator Queue Feedback',
    'select_node': '-- Choose node --',
    'select_fac_label': 'Select Facility',
    'accurate': '👍 Accurate',
    'inaccurate': '👎 Busy/Inaccurate',
    'comment_placeholder': 'Comment (e.g. queue is longer)',
    'submit': 'Submit Feedback',
    'feedback_sent': 'Thank you! Your feedback has been sent to operations.',

    // AI Companion
    'ai_title': 'AI Companion',
    'ai_subtitle': 'Grounded Live Decision Assistant',
    'ask_ai': 'Ask AI companion...',
    'ask_ai_title': 'Ask StadiumFlow AI',
    'ask_ai_desc': 'I can help you navigate paths, find short queues, and check gate operational status.',
    'rec_facility_card': 'RECOMMENDED FACILITY',
    'saves_badge': 'Saves',
    'alt_considered': 'Alternatives considered:',

    // Timeline Steps
    'matchday_timeline': 'Matchday Timeline',
    'timeline_sub': 'Dynamic timeline recalculated in real-time based on concourse congestion.',
    'no_timeline': 'No timeline generated yet. Enter your seat & gate details above to generate your plan.',
    'depart': 'Depart to Stadium',
    'arrive': 'Arrive at Gate',
    'security': 'Security Check',
    'navigate_seat': 'Navigate to Seat',
    'reach_seat': 'Reach Seat',
    'kickoff': 'Match Kickoff',
    'smart_exit': 'Post-Match Smart Exit',

    // Timeline descriptions
    'desc_depart': 'Leave from your current location. Estimated travel time is 45 minutes via public transport.',
    'desc_arrive': 'Have your digital ticket and ID ready. Ensure no prohibited items are in bags.',
    'desc_security': 'Estimated wait time is {wait} mins. Congestion level: {level}.',
    'desc_navigate': 'Follow the route from gate to {section}. Walking distance: {dist}m.',
    'desc_seat': 'Located in {section}, Row {row}, Seat {seat}. Get settled in and enjoy the pre-match show.',
    'desc_kickoff': 'FIFA World Cup 2026 match kickoff! Spain vs Argentina.',
    'desc_exit': 'Match ends. Exit via Gate {gate} or check live transport boards for alternative routes. Est. Delay: {wait} mins.',
  },
  hi: {
    // Landing
    'stadiumflow_ai': 'स्टेडियमफ्लो एआई (StadiumFlow AI)',
    'decision_layer': 'रीयल-टाइम निर्णय बुद्धिमत्ता परत • फीफा विश्व कप 2026',
    'spectator_portal': 'दर्शक प्रशंसक पोर्टल (Spectator Portal)',
    'command_center': 'कमांड सेंटर (Command Center)',
    'seat_section': 'सीट सेक्शन',
    'row': 'रो (Row)',
    'seat': 'सीट (Seat)',
    'arrival_entrance': 'आगमन द्वार (Entrance)',
    'preferred_language': 'पसंदीदा भाषा (Language)',
    'accessibility_mode': 'सुलभ रूटिंग मोड (Accessibility Mode)',
    'accessibility_desc': '(लिफ्ट और रैंप को प्राथमिकता देता है, सीढ़ियों से बचता है)',
    'enter_stadium': 'स्मार्ट स्टेडियम मैप में प्रवेश करें',
    'launch_command': 'कमांड सेंटर डैशबोर्ड लॉन्च करें',

    // Headers & Common
    'exit': 'बाहर निकलें (Exit)',
    'exit_console': 'कंसोल बंद करें',
    'sync_live': 'लाइव सिंक करें',
    'active': 'सक्रिय',
    'normal': 'सामान्य',
    'heavy': 'भारी',
    'overload': 'अतिभारित',
    'closed': 'बंद',
    'normal_ops': 'सामान्य संचालन',
    'incident_mode': 'सक्रिय घटना / चेतावनी मोड',

    // Map
    'smart_stadium_map': 'स्मार्ट स्टेडियम मानचित्र',
    'map_sub_fan': 'प्रारंभिक द्वार और अंतिम गंतव्य सेट करने के लिए नोड्स पर क्लिक करें',
    'map_sub_op': 'लाइव नेटवर्क फ्लो और भीड़ ओवरले',
    'no_path': 'कोई मार्ग नहीं चुना गया। रूट करने के लिए मानचित्र नोड्स पर क्लिक करें।',
    'start_node': 'शुरुआती गेट',
    'dest_node': 'गंतव्य',
    
    // Path Details
    'path_details': 'परिकलित सक्रिय पथ विवरण',
    'distance': 'दूरी',
    'time': 'समय',
    'meters': 'मीटर',
    'minutes': 'मिनट',

    // Facility Explorer
    'facility_explorer': 'सुविधा कतार एक्सप्लोरर',
    'facility_sub': 'पैदल दूरी + कतार प्रतीक्षा समय के आधार पर सबसे तेज़ विकल्पों की सिफारिश करता है।',
    'restrooms': 'शौचालय (Restrooms)',
    'foods': 'फूड स्टॉल (Food)',
    'medicals': 'चिकित्सा बिंदु',
    'infos': 'सूचना पटल',
    'name': 'नाम',
    'walk_time': 'पैदल समय',
    'queue_wait': 'कतार प्रतीक्षा',
    'total_est': 'कुल अनुमानित समय',
    'actions': 'कार्रवाई',
    'route_here': 'यहाँ का मार्ग',
    'fastest': 'सबसे तेज़',
    'no_facilities': 'कोई सुविधाएँ नहीं मिलीं या सुलभ नहीं हैं।',

    // Feedback Loop
    'feedback_title': 'दर्शक कतार प्रतिक्रिया',
    'select_node': '-- नोड चुनें --',
    'select_fac_label': 'सुविधा का चयन करें',
    'accurate': '👍 सटीक',
    'inaccurate': '👎 व्यस्त/गलत',
    'comment_placeholder': 'टिप्पणी (जैसे कतार लंबी है)',
    'submit': 'प्रतिक्रिया भेजें',
    'feedback_sent': 'धन्यवाद! आपकी प्रतिक्रिया संचालन टीम को भेज दी गई है।',

    // AI Companion
    'ai_title': 'एआई साथी (AI Companion)',
    'ai_subtitle': 'लाइव निर्णय सहायक (Grounded)',
    'ask_ai': 'एआई साथी से पूछें...',
    'ask_ai_title': 'स्टेडियमफ्लो एआई से पूछें',
    'ask_ai_desc': 'मैं आपको मार्ग नेविगेट करने, छोटी कतारें खोजने और गेट संचालन स्थिति की जांच करने में मदद कर सकता हूं।',
    'rec_facility_card': 'अनुशंसित सुविधा',
    'saves_badge': 'बचाता है',
    'alt_considered': 'वैकल्पिक विचारित:',

    // Timeline Steps
    'matchday_timeline': 'मैच के दिन की समयरेखा',
    'timeline_sub': 'भीड़भाड़ के आधार पर वास्तविक समय में पुनर्गणना की गई समयरेखा।',
    'no_timeline': 'अभी तक कोई समयरेखा उत्पन्न नहीं हुई है। अपनी योजना बनाने के लिए ऊपर अपनी सीट और गेट का विवरण दर्ज करें।',
    'depart': 'स्टेडियम के लिए प्रस्थान',
    'arrive': 'गेट पर आगमन',
    'security': 'सुरक्षा जांच',
    'navigate_seat': 'सीट तक नेविगेट करें',
    'reach_seat': 'सीट पर पहुंचें',
    'kickoff': 'मैच किकऑफ़ (Match Kickoff)',
    'smart_exit': 'मैच के बाद स्मार्ट निकास',

    // Timeline descriptions
    'desc_depart': 'अपने वर्तमान स्थान से निकलें। पब्लिक ट्रांसपोर्ट द्वारा अनुमानित यात्रा समय 45 मिनट है।',
    'desc_arrive': 'अपना डिजिटल टिकट और आईडी तैयार रखें। सुनिश्चित करें कि बैग में कोई प्रतिबंधित सामान न हो।',
    'desc_security': 'अनुमानित प्रतीक्षा समय {wait} मिनट है। भीड़ का स्तर: {level}.',
    'desc_navigate': 'गेट से {section} तक मार्ग का पालन करें। पैदल दूरी: {dist} मीटर है।',
    'desc_seat': '{section}, रो {row}, सीट {seat} में पहुंचें। आराम से बैठें और मैच-पूर्व शो का आनंद लें।',
    'desc_kickoff': 'फीफा विश्व कप २०२६ का मैच शुरू! स्पेन बनाम अर्जेंटीना।',
    'desc_exit': 'मैच समाप्त। गेट {gate} से बाहर निकलें या वैकल्पिक मार्गों के लिए लाइव परिवहन बोर्ड देखें। देरी का अनुमान: {wait} मिनट।',
  },
  es: {
    // Landing
    'stadiumflow_ai': 'StadiumFlow AI',
    'decision_layer': 'Capa de Inteligencia de Decisiones en Tiempo Real • Copa Mundial de la FIFA 2026',
    'spectator_portal': 'Portal del Espectador',
    'command_center': 'Centro de Mando',
    'seat_section': 'Sección de Asiento',
    'row': 'Fila',
    'seat': 'Asiento',
    'arrival_entrance': 'Entrada de Llegada',
    'preferred_language': 'Idioma Preferido',
    'accessibility_mode': 'Modo de enrutamiento accesible',
    'accessibility_desc': '(prioriza ascensores y rampas, evita escaleras)',
    'enter_stadium': 'Entrar al Mapa del Estadio Inteligente',
    'launch_command': 'Iniciar Tablero de Centro de Mando',

    // Headers & Common
    'exit': 'Salir',
    'exit_console': 'Cerrar Consola',
    'sync_live': 'Sincronizar en Vivo',
    'active': 'Activo',
    'normal': 'Normal',
    'heavy': 'Pesado',
    'overload': 'Sobrecarga',
    'closed': 'Cerrado',
    'normal_ops': 'Operaciones Normales',
    'incident_mode': 'Modo de Incidente Activo / Advertencia',

    // Map
    'smart_stadium_map': 'Mapa del Estadio Inteligente',
    'map_sub_fan': 'Haz clic en los nodos para definir la Entrada de Inicio y el Destino de Fin',
    'map_sub_op': 'Capa de flujo de red en vivo y congestión',
    'no_path': 'No se seleccionó ninguna ruta. Haz clic en los nodos del mapa para enrutar.',
    'start_node': 'Entrada de Inicio',
    'dest_node': 'Destino',
    
    // Path Details
    'path_details': 'Detalles de la Ruta Activa Calculada',
    'distance': 'Distancia',
    'time': 'Tiempo',
    'meters': 'metros',
    'minutes': 'minutos',

    // Facility Explorer
    'facility_explorer': 'Explorador de Instalaciones',
    'facility_sub': 'Recomienda las opciones más rápidas según la distancia a pie + el tiempo de espera en cola.',
    'restrooms': 'Baños',
    'foods': 'Puestos de Comida',
    'medicals': 'Puntos Médicos',
    'infos': 'Mesas de Información',
    'name': 'Nombre',
    'walk_time': 'Tiempo de Caminata',
    'queue_wait': 'Espera en Cola',
    'total_est': 'Tiempo Total Est.',
    'actions': 'Acciones',
    'route_here': 'Ruta Aquí',
    'fastest': 'Más Rápido',
    'no_facilities': 'No se encontraron instalaciones o no son accesibles.',

    // Feedback Loop
    'feedback_title': 'Comentarios sobre la Cola del Espectador',
    'select_node': '-- Elegir nodo --',
    'select_fac_label': 'Seleccionar Instalación',
    'accurate': '👍 Preciso',
    'inaccurate': '👎 Ocupado/Impreciso',
    'comment_placeholder': 'Comentario (ej. la cola es más larga)',
    'submit': 'Enviar',
    'feedback_sent': '¡Gracias! Tus comentarios han sido enviados a operaciones.',

    // AI Companion
    'ai_title': 'Compañero de IA',
    'ai_subtitle': 'Asistente de Decisiones en Vivo Grounded',
    'ask_ai': 'Preguntar al compañero de IA...',
    'ask_ai_title': 'Preguntar a la IA de StadiumFlow',
    'ask_ai_desc': 'Puedo ayudarte a navegar rutas, encontrar colas cortas y verificar el estado operativo de las puertas.',
    'rec_facility_card': 'INSTALACIÓN RECOMMENDADA',
    'saves_badge': 'Ahorra',
    'alt_considered': 'Alternativas consideradas:',

    // Timeline Steps
    'matchday_timeline': 'Línea de Tiempo del Día del Partido',
    'timeline_sub': 'Línea de tiempo dinámica recalculada según la congestión.',
    'no_timeline': 'Aún no se ha generado la línea de tiempo. Ingresa la información de tu asiento y puerta arriba para generar tu plan.',
    'depart': 'Salida hacia el Estadio',
    'arrive': 'Llegada a la Puerta',
    'security': 'Control de Seguridad',
    'navigate_seat': 'Navegar al Asiento',
    'reach_seat': 'Llegar al Asiento',
    'kickoff': 'Inicio del Partido',
    'smart_exit': 'Salida Inteligente Post-Partido',

    // Timeline descriptions
    'desc_depart': 'Sal de tu ubicación actual. El tiempo de viaje estimado es de 45 minutos en transporte público.',
    'desc_arrive': 'Prepara tu boleto digital e identificación. Asegúrate de no llevar artículos prohibidos en las bolsas.',
    'desc_security': 'El tiempo de espera estimado es de {wait} minutos. Nivel de congestión: {level}.',
    'desc_navigate': 'Sigue la ruta desde la puerta hasta la {section}. Distancia a pie: {dist}m.',
    'desc_seat': 'Ubicado en la {section}, Fila {row}, Asiento {seat}. Acomódate y disfruta del espectáculo previo al partido.',
    'desc_kickoff': '¡Comienza el partido de la Copa Mundial de la FIFA 2026! España vs Argentina.',
    'desc_exit': 'El partido termina. Sal del estadio por la Puerta {gate} o consulta los paneles de transporte en vivo para ver rutas alternativas. Retraso estimado: {wait} minutos.',
  },
  fr: {
    // Landing
    'stadiumflow_ai': 'StadiumFlow AI',
    'decision_layer': 'Couche d’Intelligence Décisionnelle en Temps Réel • Coupe du Monde de la FIFA 2026',
    'spectator_portal': 'Portail du Spectateur',
    'command_center': 'Centre de Commandement',
    'seat_section': 'Section de Siège',
    'row': 'Rangée',
    'seat': 'Siège',
    'arrival_entrance': 'Entrée d’Arrivée',
    'preferred_language': 'Langue Préférée',
    'accessibility_mode': 'Mode de routage accessible',
    'accessibility_desc': '(priorise ascenseurs et rampes, évite les escaliers)',
    'enter_stadium': 'Entrer dans la Carte du Stade Intelligent',
    'launch_command': 'Lancer le Tableau de Bord',

    // Headers & Common
    'exit': 'Quitter',
    'exit_console': 'Fermer la Console',
    'sync_live': 'Synchroniser en Direct',
    'active': 'Actif',
    'normal': 'Normal',
    'heavy': 'Chargé',
    'overload': 'Surchargé',
    'closed': 'Fermé',
    'normal_ops': 'Opérations Normales',
    'incident_mode': 'Incident Actif / Avertissement',

    // Map
    'smart_stadium_map': 'Carte du Stade Intelligent',
    'map_sub_fan': 'Cliquez sur les nœuds pour définir l’entrée de départ et la destination',
    'map_sub_op': 'Flux réseau en direct et couche de congestion',
    'no_path': 'Aucun itinéraire sélectionné. Cliquez sur les nœuds de la carte pour tracer l’itinéraire.',
    'start_node': 'Entrée de Départ',
    'dest_node': 'Destination',
    
    // Path Details
    'path_details': 'Détails de l’Itinéraire Actif',
    'distance': 'Distance',
    'time': 'Temps',
    'meters': 'mètres',
    'minutes': 'minutes',

    // Facility Explorer
    'facility_explorer': 'Explorateur de Files d’Attente',
    'facility_sub': 'Recommande les options les plus rapides en combinant temps de marche + attente.',
    'restrooms': 'Toilettes',
    'foods': 'Piliers de Nourriture',
    'medicals': 'Postes Médicaux',
    'infos': 'Guichets d’Information',
    'name': 'Nom',
    'walk_time': 'Temps de Marche',
    'queue_wait': 'Attente File',
    'total_est': 'Temps Total Est.',
    'actions': 'Actions',
    'route_here': 'S’y Rendre',
    'fastest': 'Le Plus Rapide',
    'no_facilities': 'Aucune installation trouvée ou accessible.',

    // Feedback Loop
    'feedback_title': 'Retour sur la File d’Attente',
    'select_node': '-- Choisir nœud --',
    'select_fac_label': 'Sélectionner l’Installation',
    'accurate': '👍 Précis',
    'inaccurate': '👎 Occupé/Imprécis',
    'comment_placeholder': 'Commentaire (ex: file plus longue)',
    'submit': 'Soumettre',
    'feedback_sent': 'Merci ! Votre retour a été envoyé aux opérations.',

    // AI Companion
    'ai_title': 'Compagnon IA',
    'ai_subtitle': 'Assistant Décisionnel Grounded en Direct',
    'ask_ai': 'Demander au compagnon IA...',
    'ask_ai_title': 'Poser une question à StadiumFlow IA',
    'ask_ai_desc': 'Je peux vous aider à naviguer, trouver des files d’attente courtes et vérifier le statut des portes.',
    'rec_facility_card': 'INSTALLATION RECOMMANDÉE',
    'saves_badge': 'Économise',
    'alt_considered': 'Alternatives considérées :',

    // Timeline Steps
    'matchday_timeline': 'Chronologie de la Journée de Match',
    'timeline_sub': 'Chronologie dynamique recalculée en temps réel selon la congestion.',
    'no_timeline': 'Aucune chronologie générée. Entrez votre siège et porte ci-dessus.',
    'depart': 'Départ pour le Stade',
    'arrive': 'Arrivée à la Porte',
    'security': 'Contrôle de Sécurité',
    'navigate_seat': 'Naviguer vers le Siège',
    'reach_seat': 'Arriver au Siège',
    'kickoff': 'Coup d’Envoi',
    'smart_exit': 'Sortie Post-Match',

    // Timeline descriptions
    'desc_depart': 'Partez de votre emplacement. Temps de trajet estimé à 45 minutes en transports publics.',
    'desc_arrive': 'Préparez votre billet numérique et votre identité. Assurez-vous d’éviter les bagages volumineux.',
    'desc_security': 'Attente estimée de {wait} minutes. Niveau de congestion : {level}.',
    'desc_navigate': 'Suivez l’itinéraire de la porte à la {section}. Distance : {dist}m.',
    'desc_seat': 'Situé dans la {section}, Rang {row}, Siège {seat}. Installez-vous et profitez de l’ambiance.',
    'desc_kickoff': 'Coup d’envoi de la Coupe du Monde de la FIFA 2026 ! Espagne vs Argentine.',
    'desc_exit': 'Fin du match. Sortez par la Porte {gate} ou consultez les panneaux de transport en direct. Retard : {wait} min.',
  },
  de: {
    // Landing
    'stadiumflow_ai': 'StadiumFlow AI',
    'decision_layer': 'Echtzeit-Entscheidungshilfe-Ebene • FIFA Weltmeisterschaft 2026',
    'spectator_portal': 'Spectator Fan-Portal',
    'command_center': 'Kommandozentrale',
    'seat_section': 'Sitzplatzbereich',
    'row': 'Reihe',
    'seat': 'Sitz',
    'arrival_entrance': 'Ankunftseingang',
    'preferred_language': 'Bevorzugte Sprache',
    'accessibility_mode': 'Barrierefreies Routing',
    'accessibility_desc': '(bevorzugt Aufzüge und Rampen, vermeidet Treppen)',
    'enter_stadium': 'Stadionkarte betreten',
    'launch_command': 'Kommando-Dashboard starten',

    // Headers & Common
    'exit': 'Verlassen',
    'exit_console': 'Konsole schließen',
    'sync_live': 'Live synchronisieren',
    'active': 'Aktiv',
    'normal': 'Normal',
    'heavy': 'Stark',
    'overload': 'Überlastet',
    'closed': 'Geschlossen',
    'normal_ops': 'Normaler Betrieb',
    'incident_mode': 'Aktiver Vorfall / Warnung',

    // Map
    'smart_stadium_map': 'Intelligente Stadionkarte',
    'map_sub_fan': 'Klicken Sie auf Knoten, um Starteingang & Ziel festzulegen',
    'map_sub_op': 'Live-Netzwerkfluss und Stauebene',
    'no_path': 'Keine Route ausgewählt. Klicken Sie auf Knoten, um eine Route zu berechnen.',
    'start_node': 'Starteingang',
    'dest_node': 'Ziel',
    
    // Path Details
    'path_details': 'Details der berechneten Route',
    'distance': 'Entfernung',
    'time': 'Zeit',
    'meters': 'Meter',
    'minutes': 'Minuten',

    // Facility Explorer
    'facility_explorer': 'Warteschlangen-Explorer',
    'facility_sub': 'Empfiehlt die schnellsten Optionen basierend auf Gehzeit + Wartezeit.',
    'restrooms': 'Toiletten',
    'foods': 'Imbissstände',
    'medicals': 'Sanitätsstationen',
    'infos': 'Informationsschalter',
    'name': 'Name',
    'walk_time': 'Gehzeit',
    'queue_wait': 'Wartezeit',
    'total_est': 'Est. Gesamtzeit',
    'actions': 'Aktionen',
    'route_here': 'Hierher routen',
    'fastest': 'Am schnellsten',
    'no_facilities': 'Keine Einrichtungen gefunden oder erreichbar.',

    // Feedback Loop
    'feedback_title': 'Zuschauer-Warteschlangen-Feedback',
    'select_node': '-- Knoten wählen --',
    'select_fac_label': 'Einrichtung auswählen',
    'accurate': '👍 Korrekt',
    'inaccurate': '👎 Überfüllt/Inkorrekt',
    'comment_placeholder': 'Kommentar (z. B. Warteschlange ist länger)',
    'submit': 'Absenden',
    'feedback_sent': 'Danke! Ihr Feedback wurde an die Betriebsleitung gesendet.',

    // AI Companion
    'ai_title': 'KI-Begleiter',
    'ai_subtitle': 'Grounded Live-Entscheidungsassistent',
    'ask_ai': 'Fragen Sie den KI-Begleiter...',
    'ask_ai_title': 'StadiumFlow KI fragen',
    'ask_ai_desc': 'Ich kann Ihnen helfen, Routen zu finden, Warteschlangen zu prüfen und den Status der Tore zu erfahren.',
    'rec_facility_card': 'EMPFOHLENE EINRICHTUNG',
    'saves_badge': 'Spart',
    'alt_considered': 'Berücksichtigte Alternativen:',

    // Timeline Steps
    'matchday_timeline': 'Spieltag-Zeitplan',
    'timeline_sub': 'Dynamischer Zeitplan, basierend auf Live-Staus neu berechnet.',
    'no_timeline': 'Noch kein Zeitplan. Geben Sie Sitz- und Torinformationen ein.',
    'depart': 'Abfahrt zum Stadion',
    'arrive': 'Ankunft am Tor',
    'security': 'Sicherheitskontrolle',
    'navigate_seat': 'Zum Sitzplatz navigieren',
    'reach_seat': 'Sitzplatz erreichen',
    'kickoff': 'Anstoß',
    'smart_exit': 'Intelligenter Ausgang nach dem Spiel',

    // Timeline descriptions
    'desc_depart': 'Verlassen Sie Ihren Standort. Die geschätzte Fahrtzeit mit öffentlichen Verkehrsmitteln beträgt 45 Minuten.',
    'desc_arrive': 'Halten Sie Ihr digitales Ticket und Ihren Ausweis bereit. Vermeiden Sie verbotene Gegenstände.',
    'desc_security': 'Geschätzte Wartezeit {wait} Minuten. Stauebene: {level}.',
    'desc_navigate': 'Folgen Sie dem Weg vom Tor zum {section}. Gehdistanz: {dist}m.',
    'desc_seat': 'Befindet sich in {section}, Reihe {row}, Sitz {seat}. Machen Sie es sich bequem.',
    'desc_kickoff': 'Anpfiff für das FIFA Weltmeisterschaftsspiel 2026! Spanien gegen Argentinien.',
    'desc_exit': 'Das Spiel endet. Verlassen Sie das Stadion über Tor {gate} oder prüfen Sie Live-Verkehrstafeln. Verzögerung: {wait} Min.',
  }
};

export const translate = (key, lang = 'en') => {
  let targetLang = 'en';
  const l = lang ? lang.toLowerCase() : 'en';
  if (l === 'hi' || l === 'hinglish') targetLang = 'hi';
  else if (l === 'es') targetLang = 'es';
  else if (l === 'fr') targetLang = 'fr';
  else if (l === 'de') targetLang = 'de';
  return DICTIONARY[targetLang]?.[key] || DICTIONARY['en']?.[key] || key;
};
