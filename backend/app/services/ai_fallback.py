from typing import Any, Dict, List


class AIFallbackService:
    @staticmethod
    def get_route_explanation(start_name: str, end_name: str, total_dist: float, est_time: float, avg_cong: float, lang: str = "en") -> str:
        if lang == "hi":
            return f"{start_name} से {end_name} तक का मार्ग चुना गया है। कुल दूरी {total_dist} मीटर है और चलने में लगभग {est_time} मिनट लगेंगे। इस मार्ग पर औसत भीड़ का स्तर {avg_cong}x है।"
        elif lang == "hinglish":
            return f"{start_name} se {end_name} tak ka rasta select kiya gaya hai. Total distance {total_dist} meters hai aur walk karne me lagbhag {est_time} minutes lagenge. Is route par average congestion level {avg_cong}x hai."
        elif lang == "es":
            return f"Su ruta desde {start_name} hasta {end_name} ha sido calculada. La distancia total es de {total_dist} metros, tomando aproximadamente {est_time} minutos a pie. La ruta tiene un nivel promedio de congestión de {avg_cong}x."
        else:
            return f"Your route from {start_name} to {end_name} is calculated. Total distance is {total_dist} meters, taking approximately {est_time} minutes to walk. The path has an average crowd congestion level of {avg_cong}x."

    @staticmethod
    def get_recommendation_explanation(recommended_option: str, category: str, est_time: float, time_saved: float, reason_codes: List[str], closest_name: str, lang: str = "en") -> str:
        if lang == "hi":
            return AIFallbackService._get_reco_hi(recommended_option, category, est_time, time_saved, reason_codes, closest_name)
        elif lang == "hinglish":
            return AIFallbackService._get_reco_hinglish(recommended_option, category, est_time, time_saved, reason_codes, closest_name)
        elif lang == "es":
            return AIFallbackService._get_reco_es(recommended_option, category, est_time, time_saved, reason_codes, closest_name)
        else:
            return AIFallbackService._get_reco_en(recommended_option, category, est_time, time_saved, reason_codes, closest_name)

    @staticmethod
    def _get_reco_hi(recommended_option: str, category: str, est_time: float, time_saved: float, reason_codes: List[str], closest_name: str) -> str:
        if "CLOSEST_IS_FASTEST" in reason_codes:
            return f"{recommended_option} अभी के लिए सबसे पास और सबसे तेज़ {category} विकल्प है। वहाँ पहुँचने में {est_time} मिनट लगेंगे।"
        if time_saved > 0:
            return f"हम {recommended_option} की सलाह देते हैं। यह निकटतम विकल्प ({closest_name}) से थोड़ा दूर है, लेकिन कम कतार होने के कारण आपके {time_saved} मिनट बचेंगे! कुल समय: {est_time} मिनट।"
        return f"हमने आपके लिए {recommended_option} का सुझाव दिया है। कुल अपेक्षित समय: {est_time} मिनट।"

    @staticmethod
    def _get_reco_hinglish(recommended_option: str, category: str, est_time: float, time_saved: float, reason_codes: List[str], closest_name: str) -> str:
        if "CLOSEST_IS_FASTEST" in reason_codes:
            return f"{recommended_option} abhi ke liye sabse paas aur sabse tez {category} option hai. Wahan pahunchne me {est_time} minutes lagenge."
        if time_saved > 0:
            return f"Hum {recommended_option} suggest karte hain. Ye nearest option ({closest_name}) se thoda door hai, lekin queue choti hone ke karan aapke {time_saved} minutes bachenge! Total time: {est_time} minutes."
        return f"Humne aapke liye {recommended_option} suggest kiya hai. Total time: {est_time} minutes."

    @staticmethod
    def _get_reco_es(recommended_option: str, category: str, est_time: float, time_saved: float, reason_codes: List[str], closest_name: str) -> str:
        if "CLOSEST_IS_FASTEST" in reason_codes:
            return f"{recommended_option} es actualmente la opción de {category} más cercana y rápida. Tomará aproximadamente {est_time} minutos."
        if time_saved > 0:
            return f"Recomendamos {recommended_option}. Está un poco más lejos que la opción más cercana ({closest_name}), pero su fila más corta le ahorrará aproximadamente {time_saved} minutos en total. Tiempo estimado: {est_time} min."
        return f"Recomendamos usar {recommended_option}. Tiempo total esperado: {est_time} minutos."

    @staticmethod
    def _get_reco_en(recommended_option: str, category: str, est_time: float, time_saved: float, reason_codes: List[str], closest_name: str) -> str:
        if "CLOSEST_IS_FASTEST" in reason_codes:
            return f"{recommended_option} is currently the closest and fastest {category} option. It will take about {est_time} minutes."
        if time_saved > 0:
            return f"We recommend {recommended_option}. It is slightly farther than the closest option ({closest_name}), but its shorter queue will save you about {time_saved} minutes overall. Total expected time: {est_time} mins."
        return f"We recommend using {recommended_option}. Total expected time: {est_time} minutes."

    @staticmethod
    def get_operations_brief(live_state: Dict[str, Any], nodes: Dict[str, Any], lang: str = "en") -> str:
        if lang == "hi":
            return AIFallbackService._get_brief_hi(live_state, nodes)
        elif lang == "hinglish":
            return AIFallbackService._get_brief_hinglish(live_state, nodes)
        elif lang == "es":
            return AIFallbackService._get_brief_es(live_state, nodes)
        else:
            return AIFallbackService._get_brief_en(live_state, nodes)

    @staticmethod
    def _get_brief_hi(live_state: Dict[str, Any], nodes: Dict[str, Any]) -> str:
        incidents = live_state.get("active_incidents", [])
        closures = live_state.get("gate_closures", [])
        brief = "### 🏟️ स्मार्ट स्टेडियम एआई संचालन रिपोर्ट\n\n"
        if not incidents and not closures:
            brief += "✅ **सिस्टम स्थिति:** स्टेडियम वर्तमान में सामान्य रूप से काम कर रहा है। सभी गेट और सुविधाएं खुली हैं।\n"
        else:
            brief += "⚠️ **संचालन अलर्ट:** स्टेडियम में वर्तमान में कुछ समस्याएं हैं:\n"
            for inc in incidents:
                brief += f"- **[{inc.severity.upper()}]** {inc.title}: {inc.message}\n"
            for g_id in closures:
                brief += f"- 🛑 गेट बंद: {nodes.get(g_id, {}).get('name', g_id)} वर्तमान में बंद है।\n"
        brief += "\nएआई मॉडल ऑफलाइन: बैकअप नियमों पर चल रहा है।"
        return brief

    @staticmethod
    def _get_brief_hinglish(live_state: Dict[str, Any], nodes: Dict[str, Any]) -> str:
        incidents = live_state.get("active_incidents", [])
        closures = live_state.get("gate_closures", [])
        brief = "### 🏟️ Smart Stadium AI Operations Report\n\n"
        if not incidents and not closures:
            brief += "✅ **System Status:** Stadium abhi normal kaam kar raha hai. Sabhi gates aur facilities open hain.\n"
        else:
            brief += "⚠️ **Operational Alerts:** Stadium me kuch operational issues hain:\n"
            for inc in incidents:
                brief += f"- **[{inc.severity.upper()}]** {inc.title}: {inc.message}\n"
            for g_id in closures:
                brief += f"- 🛑 Gate Closed: {nodes.get(g_id, {}).get('name', g_id)} abhi closed hai.\n"
        brief += "\nAI Model Offline: Deterministic rules backup system active."
        return brief

    @staticmethod
    def _get_brief_es(live_state: Dict[str, Any], nodes: Dict[str, Any]) -> str:
        incidents = live_state.get("active_incidents", [])
        closures = live_state.get("gate_closures", [])
        brief = "### 🏟️ Informe de Operaciones de Estadio Inteligente IA\n\n"
        if not incidents and not closures:
            brief += "✅ **Estado del Sistema:** El estadio está operando normalmente. Todas las puertas y servicios están abiertos.\n"
        else:
            brief += "⚠️ **Alertas Operativas:** El estadio está experimentando ajustes operativos:\n"
            for inc in incidents:
                brief += f"- **[{inc.severity.upper()}]** {inc.title}: {inc.message}\n"
            for g_id in closures:
                brief += f"- 🛑 Puerta Cerrada: {nodes.get(g_id, {}).get('name', g_id)} está actualmente cerrada.\n"
        brief += "\nModelo de IA fuera de línea: Ejecutando en base a reglas deterministas."
        return brief

    @staticmethod
    def _get_brief_en(live_state: Dict[str, Any], nodes: Dict[str, Any]) -> str:
        incidents = live_state.get("active_incidents", [])
        closures = live_state.get("gate_closures", [])
        brief = "### 🏟️ Smart Stadium AI Command Brief\n\n"
        if not incidents and not closures:
            brief += "✅ **System Status:** The stadium is operating normally. All gates and services are open.\n"
        else:
            brief += "⚠️ **Operational Alerts:** The stadium is experiencing operational adjustments:\n"
            for inc in incidents:
                brief += f"- **[{inc.severity.upper()}]** {inc.title}: {inc.message}\n"
            for g_id in closures:
                brief += f"- 🛑 Gate Closed: {nodes.get(g_id, {}).get('name', g_id)} is currently closed.\n"
        brief += "\nAI Model Offline: Running on deterministic rule backup."
        return brief

    @staticmethod
    def get_assistant_answer(query: str, current_node: str, live_state: Dict[str, Any], nodes: Dict[str, Any], lang: str = "en") -> str:
        q_lower = query.lower()

        # Check restrooms
        if any(w in q_lower for w in ["restroom", "washroom", "toilet", "shauchalay", "baño"]):
            return AIFallbackService._get_ans_restroom(lang)

        # Check food
        if any(w in q_lower for w in ["food", "snack", "drink", "hungry", "khana", "comida"]):
            return AIFallbackService._get_ans_food(lang)

        # Check gates
        if any(w in q_lower for w in ["gate", "entrance", "entry", "dwar", "puerta"]):
            return AIFallbackService._get_ans_gate(live_state, nodes, lang)

        # Check transit/exit
        if any(w in q_lower for w in ["parking", "bus", "taxi", "metro", "exit", "nashi", "salida"]):
            return AIFallbackService._get_ans_transit(lang)

        # Default
        return AIFallbackService._get_ans_default(lang)

    @staticmethod
    def _get_ans_restroom(lang: str) -> str:
        if lang == "hi":
            return "आप सबसे कम प्रतीक्षा समय वाले शौचालय को खोजने के लिए 'सुविधा कतार एक्सप्लोरर' टैब देख सकते हैं। हम पैदल दूरी और कतार के समय दोनों की गणना करते हैं।"
        elif lang == "hinglish":
            return "Aap 'Facility Explorer' tab me jaakar sabse kam queue wala toilet dundh sakte hain. Hum distance aur wait time dono compute karte hain."
        elif lang == "es":
            return "Puede consultar la pestaña 'Explorador de Instalaciones' para encontrar el baño más rápido disponible. Calculamos el tiempo de caminata y de cola."
        else:
            return "You can check the 'Facility Explorer' tab to find the fastest Restroom available. We calculate both walking and queue wait times to recommend the best option."

    @staticmethod
    def _get_ans_food(lang: str) -> str:
        if lang == "hi":
            return "स्टेडियम में कई फूड काउंटर उपलब्ध हैं। आप 'सुविधा कतार एक्सप्लोरर' में फूड श्रेणी का चयन करके सबसे कम कतार वाला विकल्प चुन सकते हैं।"
        elif lang == "hinglish":
            return "Stadium me bahut saare food stalls hain. Aap 'Facility Explorer' me food category choose karke short queue wala counter select kar sakte hain."
        elif lang == "es":
            return "Tenemos varios puestos de comida disponibles. Consulte la pestaña 'Explorador de Instalaciones' para ver cuál tiene la fila más corta."
        else:
            return "We have multiple food concessions (stalls, sports bars). Please check the 'Facility Explorer' to see which counter has the shortest queue time right now."

    @staticmethod
    def _get_ans_gate(live_state: Dict[str, Any], nodes: Dict[str, Any], lang: str) -> str:
        closed_gates = [nodes.get(g_id, {}).get("name", g_id) for g_id in live_state.get("gate_closures", [])]
        if closed_gates:
            closed_str = ", ".join(closed_gates)
            if lang == "hi":
                return f"अलर्ट: निम्नलिखित प्रवेश द्वार वर्तमान में बंद हैं: {closed_str}। अन्य प्रवेश द्वार खुले हैं।"
            elif lang == "hinglish":
                return f"Alert: Ye entry gates abhi closed hain: {closed_str}. Baki doors open hain, aap wait times check kar sakte hain."
            elif lang == "es":
                return f"Alerta: Las siguientes puertas están cerradas: {closed_str}. Otras puertas están abiertas; revise los tiempos de espera."
            else:
                return f"Alert: The following gates are currently closed: {closed_str}. Other gates are open; please review wait times before choosing."

        if lang == "hi":
            return "सभी प्रवेश द्वार खुले हैं। प्रवेश द्वारों पर औसत सुरक्षा जांच समय 5 मिनट है।"
        elif lang == "hinglish":
            return "Sabhi entry gates open hain. Gates par average security wait time 5 minutes hai."
        elif lang == "es":
            return "Todas las puertas están abiertas. El tiempo promedio de espera en seguridad es de 5 minutos."
        else:
            return "All entry gates are open. Security queues are operating at a standard 5-minute wait time."

    @staticmethod
    def _get_ans_transit(lang: str) -> str:
        if lang == "hi":
            return "स्टेडियम के बाहर मेट्रो स्टेशन और बस बे उपलब्ध हैं। निकासी के समय निकास मार्गों पर नज़र रखें।"
        elif lang == "hinglish":
            return "Stadium ke bahar metro station aur bus bays available hain. Exit ke samay nikalne wale raste par dhyan dein."
        elif lang == "es":
            return "La estación de metro y las paradas de autobús están ubicadas fuera del estadio. Siga las rutas de salida indicadas."
        else:
            return "Metro station and bus bays are located right outside the stadium. Please follow the exit pathways for smooth transit."

    @staticmethod
    def _get_ans_default(lang: str) -> str:
        if lang == "hi":
            return "मैं आपका स्मार्ट स्टेडियम सहायक हूँ। आप मुझसे मार्ग नेविगेशन, निकटतम शौचालय, फूड स्टॉल, एक्सेसिबिलिटी मार्ग या वर्तमान स्थिति के बारे में पूछ सकते हैं।"
        elif lang == "hinglish":
            return "Main aapka Smart Stadium assistant hoon. Aap mujhse routing, nearest toilet, food stall, accessibility paths ya live stadium status ke baare me puch sakte hain."
        elif lang == "es":
            return "Soy su asistente inteligente del estadio. Puede preguntarme sobre navegación, baños, puestos de comida, rutas de accesibilidad o el estado de la simulación en vivo."
        else:
            return "I am your Smart Stadium Assistant. You can ask me about navigation, restrooms, food stalls, accessibility routes, or real-time simulation updates."
