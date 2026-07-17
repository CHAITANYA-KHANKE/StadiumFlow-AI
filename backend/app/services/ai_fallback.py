from typing import Dict, Any, List

class AIFallbackService:
    @staticmethod
    def get_route_explanation(start_name: str, end_name: str, total_dist: float, est_time: float, avg_cong: float, lang: str = "en") -> str:
        if lang in ["hi", "hinglish"]:
            return (
                f"{start_name} से {end_name} तक का मार्ग चुना गया है। "
                f"कुल दूरी {total_dist} मीटर है और चलने में लगभग {est_time} मिनट लगेंगे। "
                f"इस मार्ग पर औसत भीड़ का स्तर {avg_cong}x है।"
            )
        elif lang == "es":
            return (
                f"Su ruta desde {start_name} hasta {end_name} ha sido calculada. "
                f"La distancia total es de {total_dist} metros, tomando aproximadamente {est_time} minutos a pie. "
                f"La ruta tiene un nivel promedio de congestión de {avg_cong}x."
            )
        else:
            return (
                f"Your route from {start_name} to {end_name} is calculated. "
                f"Total distance is {total_dist} meters, taking approximately {est_time} minutes to walk. "
                f"The path has an average crowd congestion level of {avg_cong}x."
            )

    @staticmethod
    def get_recommendation_explanation(recommended_option: str, category: str, est_time: float, time_saved: float, reason_codes: List[str], closest_name: str, lang: str = "en") -> str:
        is_hindi = lang in ["hi", "hinglish"]
        is_spanish = lang == "es"
        
        if "CLOSEST_IS_FASTEST" in reason_codes:
            if is_hindi:
                return f"{recommended_option} अभी के लिए सबसे पास और सबसे तेज़ {category} विकल्प है। वहाँ पहुँचने में {est_time} मिनट लगेंगे।"
            elif is_spanish:
                return f"{recommended_option} es actualmente la opción de {category} más cercana y rápida. Tomará aproximadamente {est_time} minutos."
            else:
                return f"{recommended_option} is currently the closest and fastest {category} option. It will take about {est_time} minutes."
        
        if time_saved > 0:
            if is_hindi:
                return (
                    f"हम {recommended_option} की सलाह देते हैं। यह निकटतम विकल्प ({closest_name}) से थोड़ा दूर है, "
                    f"लेकिन कम कतार होने के कारण आपके {time_saved} मिनट बचेंगे! कुल समय: {est_time} मिनट।"
                )
            elif is_spanish:
                return (
                    f"Recomendamos {recommended_option}. Está un poco más lejos que la opción más cercana ({closest_name}), "
                    f"pero su fila más corta le ahorrará aproximadamente {time_saved} minutos en total. Tiempo estimado: {est_time} min."
                )
            else:
                return (
                    f"We recommend {recommended_option}. It is slightly farther than the closest option ({closest_name}), "
                    f"but its shorter queue will save you about {time_saved} minutes overall. Total expected time: {est_time} mins."
                )
                
        if is_hindi:
            return f"हमने आपके लिए {recommended_option} का सुझाव दिया है। कुल अपेक्षित समय: {est_time} मिनट।"
        elif is_spanish:
            return f"Recomendamos usar {recommended_option}. Tiempo total esperado: {est_time} minutos."
        else:
            return f"We recommend using {recommended_option}. Total expected time: {est_time} minutes."

    @staticmethod
    def get_operations_brief(live_state: Dict[str, Any], nodes: Dict[str, Any], lang: str = "en") -> str:
        is_hindi = lang in ["hi", "hinglish"]
        is_spanish = lang == "es"
        incidents = live_state.get("active_incidents", [])
        closures = live_state.get("gate_closures", [])
        
        brief = ""
        if is_hindi:
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
        is_hindi = lang in ["hi", "hinglish"]
        is_spanish = lang == "es"
        
        # Simple keywords router
        if "restroom" in q_lower or "washroom" in q_lower or "toilet" in q_lower or "shauchalay" in q_lower or "baño" in q_lower:
            if is_hindi:
                return "आप सबसे कम प्रतीक्षा समय वाले शौचालय को खोजने के लिए 'सुविधा कतार एक्सप्लोरर' टैब देख सकते हैं। हम पैदल दूरी और कतार के समय दोनों की गणना करते हैं।"
            elif is_spanish:
                return "Puede consultar la pestaña 'Explorador de Instalaciones' para encontrar el baño más rápido disponible. Calculamos el tiempo de caminata y de cola."
            else:
                return "You can check the 'Facility Explorer' tab to find the fastest Restroom available. We calculate both walking and queue wait times to recommend the best option."
        
        if "food" in q_lower or "snack" in q_lower or "drink" in q_lower or "hungry" in q_lower or "khana" in q_lower or "comida" in q_lower:
            if is_hindi:
                return "स्टेडियम में कई फूड काउंटर उपलब्ध हैं। आप 'सुविधा कतार एक्सप्लोरर' में फूड श्रेणी का चयन करके सबसे कम कतार वाला विकल्प चुन सकते हैं।"
            elif is_spanish:
                return "Tenemos varios puestos de comida disponibles. Consulte la pestaña 'Explorador de Instalaciones' para ver cuál tiene la fila más corta."
            else:
                return "We have multiple food concessions (stalls, sports bars). Please check the 'Facility Explorer' to see which counter has the shortest queue time right now."
        
        if "gate" in q_lower or "entrance" in q_lower or "entry" in q_lower or "dwar" in q_lower or "puerta" in q_lower:
            closed_gates = [nodes.get(g_id, {}).get('name', g_id) for g_id in live_state.get("gate_closures", [])]
            if closed_gates:
                closed_str = ", ".join(closed_gates)
                if is_hindi:
                    return f"अलर्ट: निम्नलिखित प्रवेश द्वार वर्तमान में बंद हैं: {closed_str}। अन्य प्रवेश द्वार खुले हैं।"
                elif is_spanish:
                    return f"Alerta: Las siguientes puertas están cerradas: {closed_str}. Otras puertas están abiertas; revise los tiempos de espera."
                else:
                    return f"Alert: The following gates are currently closed: {closed_str}. Other gates are open; please review wait times before choosing."
            else:
                if is_hindi:
                    return "सभी प्रवेश द्वार खुले हैं। प्रवेश द्वारों पर औसत सुरक्षा जांच समय 5 मिनट है।"
                elif is_spanish:
                    return "Todas las puertas están abiertas. El tiempo promedio de espera en seguridad es de 5 minutos."
                else:
                    return "All entry gates are open. Security queues are operating at a standard 5-minute wait time."

        if is_hindi:
            return (
                "मैं आपका स्मार्ट स्टेडियम सहायक हूँ। आप मुझसे मार्ग नेвиगेसशन, निकटतम शौचालय, फूड स्टॉल, "
                "एक्सेसिबिलिटी मार्ग या वर्तमान स्थिति के बारे में पूछ सकते हैं।"
            )
        elif is_spanish:
            return (
                "Soy su asistente inteligente del estadio. Puede preguntarme sobre navegación, baños, puestos de comida, "
                "rutas de accesibilidad o el estado de la simulación en vivo."
            )
        else:
            return (
                "I am your Smart Stadium Assistant. You can ask me about navigation, restrooms, food stalls, "
                "accessibility routes, or real-time simulation updates."
            )
