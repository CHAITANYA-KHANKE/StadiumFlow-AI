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
        is_spanish = lang == "es"

        if "CLOSEST_IS_FASTEST" in reason_codes:
            if lang == "hi":
                return f"{recommended_option} अभी के लिए सबसे पास और सबसे तेज़ {category} विकल्प है। वहाँ पहुँचने में {est_time} मिनट लगेंगे।"
            elif lang == "hinglish":
                return f"{recommended_option} abhi ke liye sabse paas aur sabse tez {category} option hai. Wahan pahunchne me {est_time} minutes lagenge."
            elif is_spanish:
                return f"{recommended_option} es actualmente la opción de {category} más cercana y rápida. Tomará aproximadamente {est_time} minutos."
            else:
                return f"{recommended_option} is currently the closest and fastest {category} option. It will take about {est_time} minutes."

        if time_saved > 0:
            if lang == "hi":
                return f"हम {recommended_option} की सलाह देते हैं। यह निकटतम विकल्प ({closest_name}) से थोड़ा दूर है, लेकिन कम कतार होने के कारण आपके {time_saved} मिनट बचेंगे! कुल समय: {est_time} मिनट।"
            elif lang == "hinglish":
                return f"Hum {recommended_option} suggest karte hain. Ye nearest option ({closest_name}) se thoda door hai, lekin queue choti hone ke karan aapke {time_saved} minutes bachenge! Total time: {est_time} minutes."
            elif is_spanish:
                return f"Recomendamos {recommended_option}. Está un poco más lejos que la opción más cercana ({closest_name}), pero su fila más corta le ahorrará aproximadamente {time_saved} minutos en total. Tiempo estimado: {est_time} min."
            else:
                return f"We recommend {recommended_option}. It is slightly farther than the closest option ({closest_name}), but its shorter queue will save you about {time_saved} minutes overall. Total expected time: {est_time} mins."

        if lang == "hi":
            return f"हमने आपके लिए {recommended_option} का सुझाव दिया है। कुल अपेक्षित समय: {est_time} मिनट।"
        elif lang == "hinglish":
            return f"Humne aapke liye {recommended_option} suggest kiya hai. Total expected time: {est_time} minutes."
        elif is_spanish:
            return f"Recomendamos usar {recommended_option}. Tiempo total esperado: {est_time} minutos."
        else:
            return f"We recommend using {recommended_option}. Total expected time: {est_time} minutes."

    @staticmethod
    def get_operations_brief(live_state: Dict[str, Any], nodes: Dict[str, Any], lang: str = "en") -> str:
        is_spanish = lang == "es"
        incidents = live_state.get("active_incidents", [])
        closures = live_state.get("gate_closures", [])

        brief = ""
        if lang == "hi":
            brief += "### 🏟️ स्मार्ट स्टेडियम एआई संचालन रिपोर्ट\n\n"
            if not incidents and not closures:
                brief += "✅ **सिस्टम स्थिति:** स्टेडियम वर्तमान में सामान्य रूप से काम कर रहा है। सभी गेट और सुविधाएं खुली हैं।\n"
            else:
                brief += "⚠️ **संचालन अलर्ट:** स्टेडियम में वर्तमान में कुछ समस्याएं हैं:\n"
                for inc in incidents:
                    brief += f"- **[{inc.severity.upper()}]** {inc.title}: {inc.message}\n"
                for g_id in closures:
                    brief += f"- 🛑 गेट बंद: {nodes.get(g_id, {}).get('name', g_id)} वर्तमान में बंद है।\n"
            brief += "\nएआई मॉडल ऑफलाइन: बैकअप नियमों पर चल रहा है।"
        elif lang == "hinglish":
            brief += "### 🏟️ Smart Stadium AI Operations Report\n\n"
            if not incidents and not closures:
                brief += "✅ **System Status:** Stadium abhi normal kaam kar raha hai. Sabhi gates aur facilities open hain.\n"
            else:
                brief += "⚠️ **Operational Alerts:** Stadium me kuch operational issues hain:\n"
                for inc in incidents:
                    brief += f"- **[{inc.severity.upper()}]** {inc.title}: {inc.message}\n"
                for g_id in closures:
                    brief += f"- 🛑 Gate Closed: {nodes.get(g_id, {}).get('name', g_id)} abhi closed hai.\n"
            brief += "\nAI Model Offline: Deterministic rules backup system active."
        elif is_spanish:
            brief += "### 🏟️ Informe de Operaciones de Estadio Inteligente IA\n\n"
            if not incidents and not closures:
                brief += "✅ **Estado del Sistema:** El estadio está operando normalmente. Todas las puertas y servicios están abiertos.\n"
            else:
                brief += "⚠️ **Alertas Operativas:** El estadio está experimentando ajustes operativos:\n"
                for inc in incidents:
                    brief += f"- **[{inc.severity.upper()}]** {inc.title}: {inc.message}\n"
                for g_id in closures:
                    brief += f"- 🛑 Puerta Cerrada: {nodes.get(g_id, {}).get('name', g_id)} está actualmente cerrada.\n"
            brief += "\nModelo de IA fuera de línea: Ejecutando en base a reglas deterministas."
        else:
            brief += "### 🏟️ Smart Stadium AI Command Brief\n\n"
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
        is_spanish = lang == "es"

        # Simple keywords router
        if "restroom" in q_lower or "washroom" in q_lower or "toilet" in q_lower or "shauchalay" in q_lower or "baño" in q_lower:
            if lang == "hi":
                return "आप सबसे कम प्रतीक्षा समय वाले शौचालय को खोजने के लिए 'सुविधा कतार एक्सप्लोरर' टैब देख सकते हैं। हम पैदल दूरी और कतार के समय दोनों की गणना करते हैं।"
            elif lang == "hinglish":
                return "Aap 'Facility Explorer' tab me jaakar sabse kam queue wala toilet dundh sakte hain. Hum distance aur wait time dono compute karte hain."
            elif is_spanish:
                return "Puede consultar la pestaña 'Explorador de Instalaciones' para encontrar el baño más rápido disponible. Calculamos el tiempo de caminata y de cola."
            else:
                return "You can check the 'Facility Explorer' tab to find the fastest Restroom available. We calculate both walking and queue wait times to recommend the best option."

        if "food" in q_lower or "snack" in q_lower or "drink" in q_lower or "hungry" in q_lower or "khana" in q_lower or "comida" in q_lower:
            if lang == "hi":
                return "स्टेडियम में कई फूड काउंटर उपलब्ध हैं। आप 'सुविधा कतार एक्सप्लोरर' में फूड श्रेणी का चयन करके सबसे कम कतार वाला विकल्प चुन सकते हैं।"
            elif lang == "hinglish":
                return "Stadium me bahut saare food stalls hain. Aap 'Facility Explorer' me food category choose karke short queue wala counter select kar sakte hain."
            elif is_spanish:
                return "Tenemos varios puestos de comida disponibles. Consulte la pestaña 'Explorador de Instalaciones' para ver cuál tiene la fila más corta."
            else:
                return "We have multiple food concessions (stalls, sports bars). Please check the 'Facility Explorer' to see which counter has the shortest queue time right now."

        if "gate" in q_lower or "entrance" in q_lower or "entry" in q_lower or "dwar" in q_lower or "puerta" in q_lower:
            closed_gates = [nodes.get(g_id, {}).get("name", g_id) for g_id in live_state.get("gate_closures", [])]
            if closed_gates:
                closed_str = ", ".join(closed_gates)
                if lang == "hi":
                    return f"अलर्ट: निम्नलिखित प्रवेश द्वार वर्तमान में बंद हैं: {closed_str}। अन्य प्रवेश द्वार खुले हैं।"
                elif lang == "hinglish":
                    return f"Alert: Ye entry gates abhi closed hain: {closed_str}. Baki doors open hain, aap wait times check kar sakte hain."
                elif is_spanish:
                    return f"Alerta: Las siguientes puertas están cerradas: {closed_str}. Otras puertas están abiertas; revise los tiempos de espera."
                else:
                    return f"Alert: The following gates are currently closed: {closed_str}. Other gates are open; please review wait times before choosing."
            else:
                if lang == "hi":
                    return "सभी प्रवेश द्वार खुले हैं। प्रवेश द्वारों पर औसत सुरक्षा जांच समय 5 मिनट है।"
                elif lang == "hinglish":
                    return "Sabhi entry gates open hain. Gates par average security wait time 5 minutes hai."
                elif is_spanish:
                    return "Todas las puertas están abiertas. El tiempo promedio de espera en seguridad es de 5 minutos."
                else:
                    return "All entry gates are open. Security queues are operating at a standard 5-minute wait time."

        if lang == "hi":
            return "मैं आपका स्मार्ट स्टेडियम सहायक हूँ। आप मुझसे मार्ग नेविगेशन, निकटतम शौचालय, फूड स्टॉल, एक्सेसिबिलिटी मार्ग या वर्तमान स्थिति के बारे में पूछ सकते हैं।"
        elif lang == "hinglish":
            return "Main aapka Smart Stadium assistant hoon. Aap mujhse routing, nearest toilet, food stall, accessibility paths ya live stadium status ke baare me puch sakte hain."
        elif is_spanish:
            return "Soy su asistente inteligente del estadio. Puede preguntarme sobre navegación, baños, puestos de comida, rutas de accesibilidad o el estado de la simulación en vivo."
        else:
            return "I am your Smart Stadium Assistant. You can ask me about navigation, restrooms, food stalls, accessibility routes, or real-time simulation updates."
