
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      nav: {
        home: 'Home',
        scan: 'Scan',
        assistant: 'Assistant',
        analytics: 'Analytics',
        profile: 'Profile'
      },
      common: {
        ai_friend: 'AI Farming Friend',
        save_pdf: 'Save PDF',
        print: 'Print',
        preparing: 'Preparing...',
        saving: 'Saving...',
        analyzing: 'Analyzing...',
        language: 'Language',
        done: 'Done',
        cancel: 'Cancel',
        delete: 'Delete',
        mark_read: 'Mark Read',
        clear: 'Clear'
      },
      scan: {
        diagnose: 'Diagnose Your Crop',
        upload_desc: 'Take a photo of the infected leaf or stem for instant AI diagnosis',
        take_photo: 'Take Photo',
        gallery: 'Gallery',
        start_analysis: 'Start AI Analysis',
        symptoms: 'Visible Symptoms',
        treatment: 'Expert Treatment Solution',
        organic_alt: 'Organic Alternative',
        recent_scans: 'Recent Scans'
      },
      analytics: {
        productivity: 'Growth Tracker',
        fertilizer: 'Fertilizer Advisor',
        crop_mgmt: 'Crop Management',
        select_crop: 'Select Crop',
        farmer_details: 'Farmer Details',
        generate_report: 'Generate Report',
        growth_stages: 'Growth Stages',
        calculate: 'Calculate Recommendation'
      },
      assistant: {
        assistant: 'Assistant',
        new_chat: 'New Farming Chat',
        history: 'Chat History',
        call_expert: 'Call Expert',
        ask_placeholder: 'Ask KrsiMedha AI Assistant...',
        call_dialing: 'Dialing...',
        call_active: 'Active Session'
      },
      profile: {
        my_profile: 'My Profile',
        farm_info: 'Farm Information',
        settings: 'Settings',
        portfolio: 'Farm Portfolio',
        total_area: 'Total Area',
        primary_crop: 'Primary Crop',
        soil_type: 'Soil Type',
        water_source: 'Water Source',
        verified_account: 'Verified Farmer Account',
        logout: 'Logout System',
        system_settings: 'System Settings',
        manage_plan: 'Manage Plan',
        notifications: 'Notification Alert Settings (SMS/Voice)',
        privacy: 'Privacy & Data Usage Policies',
        version: 'App Version: 2.1.0-VIBRANT',
        activity_log: 'Notification & Activity Log',
        no_activity: 'No recent activity saved.',
        sms_alerts: 'SMS Alert System',
        sms_desc: 'Receive automatic text messages for heat waves, disease alerts, and crop health updates.',
        notif_center: 'Notification Center',
        view_all: 'View All Alerts'
      },
      home: {
        greeting: 'Good Morning, Farmer Rajesh!',
        tagline: 'Your farm is doing great today.',
        disease_scan: 'Disease Scan',
        assistant: 'Call AI',
        analytics: 'Analytics',
        market_prices: 'Market Prices',
        weather_alert: 'Heat wave alert: Increase irrigation.',
        disease_warning: 'Disease Warning',
        check_now: 'Check Now'
      }
    }
  },
  kn: {
    translation: {
      nav: {
        home: 'ಮನೆ',
        scan: 'ಸ್ಕ್ಯಾನ್',
        assistant: 'ಸಹಾಯಕ',
        analytics: 'ಮಾಹಿತಿ',
        profile: 'ಪ್ರೊಫೈಲ್'
      },
      common: {
        ai_friend: 'ಕೃಷಿ ಸ್ನೇಹಿ',
        save_pdf: 'ಪಿಡಿಎಫ್ ಉಳಿಸಿ',
        print: 'ಪ್ರಿಂಟ್',
        preparing: 'ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...',
        saving: 'ಉಳಿಸಲಾಗುತ್ತಿದೆ...',
        analyzing: 'ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
        language: 'ಭಾಷೆ',
        done: 'ಮುಗಿಯಿತು',
        cancel: 'ರದ್ದುಮಾಡಿ',
        delete: 'ಅಳಿಸಿ',
        mark_read: 'ಓದಿದ್ದೆಂದು ಗುರುತಿಸಿ',
        clear: 'ತೆರವುಗೊಳಿಸಿ'
      },
      scan: {
        diagnose: 'ಬೆಳೆ ರೋಗ ಪತ್ತೆಹಚ್ಚಿ',
        upload_desc: 'ತಕ್ಷಣದ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಪೀಡಿತ ಎಲೆ ಅಥವಾ ಕಾಂಡದ ಫೋಟೋ ತೆಗೆದುಕೊಳ್ಳಿ',
        take_photo: 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
        gallery: 'ಗ್ಯಾಲರಿ',
        start_analysis: 'ವಿಶ್ಲೇಷಣೆ ಆರಂಭಿಸಿ',
        symptoms: 'ಗೋಚರಿಸುವ ಲಕ್ಷಣಗಳು',
        treatment: 'ತಜ್ಞರ ಚಿಕಿತ್ಸಾ ಪರಿಹಾರ',
        organic_alt: 'ಸಾವಯವ ಪರ್ಯಾಯ',
        recent_scans: 'ಇತ್ತೀಚಿನ ಸ್ಕ್ಯಾನ್‌ಗಳು'
      },
      analytics: {
        productivity: 'ಬೆಳವಣಿಗೆ ಟ್ರ್ಯಾಕರ್',
        fertilizer: 'ಗೊಬ್ಬರ ಸಲಹೆ',
        crop_mgmt: 'ಬೆಳೆ ನಿರ್ವಹಣೆ',
        select_crop: 'ಬೆಳೆ ಆರಿಸಿ',
        farmer_details: 'ರೈತರ ವಿವರಗಳು',
        generate_report: 'ವರದಿ ತಯಾರಿಸಿ',
        growth_stages: 'ಬೆಳವಣಿಗೆಯ ಹಂತಗಳು',
        calculate: 'ಗೊಬ್ಬರ ಸಲಹೆ ಪಡೆಯಿರಿ'
      },
      assistant: {
        assistant: 'ಸಹಾಯಕ',
        new_chat: 'ಹೊಸ ಚಾಟ್',
        history: 'ಚಾಟ್ ಇತಿಹಾಸ',
        call_expert: 'ತಜ್ಞರಿಗೆ ಕರೆ ಮಾಡಿ',
        ask_placeholder: 'ಕೃಷಿ ಸಹಾಯಕಕ್ಕೆ ಕೇಳಿ...',
        call_dialing: 'ಡಯಲಿಂಗ್...',
        call_active: 'ಸಕ್ರಿಯ ಸೆಷನ್'
      },
      profile: {
        my_profile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
        farm_info: 'ಫಾರ್ಮ್ ಮಾಹಿತಿ',
        settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
        portfolio: 'ಬೆಳೆ ಪೋರ್ಟ್‌ಫೋಲಿಯೋ',
        total_area: 'ಒಟ್ಟು ವಿಸ್ತೀರ್ಣ',
        primary_crop: 'ಮುಖ್ಯ ಬೆಳೆ',
        soil_type: 'ಮಣ್ಣಿನ ವಿಧ',
        water_source: 'ನೀರಿನ ಮೂಲ',
        verified_account: 'ದೃಢೀಕರಿಸಿದ ರೈತ ಖಾತೆ',
        logout: 'ಲಾಗೌಟ್',
        system_settings: 'ವ್ಯವಸ್ಥೆಯ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
        manage_plan: 'ಯೋಜನೆಯನ್ನು ನಿರ್ವಹಿಸಿ',
        notifications: 'ಅಧಿಸೂಚನೆ ಎಚ್ಚರಿಕೆ ಸೆಟ್ಟಿಂಗ್‌ಗಳು (SMS/ಧ್ವನಿ)',
        privacy: 'ಗೌಪ್ಯತೆ ಮತ್ತು ಡೇಟಾ ಬಳಕೆಯ ನೀತಿಗಳು',
        version: 'ಅಪ್ಲಿಕೇಶನ್ ಆವೃತ್ತಿ: 2.1.0-VIBRANT',
        activity_log: 'ಅಧಿಸೂಚನೆ ಮತ್ತು ಚಟುವಟಿಕೆ ಲಾಗ್',
        no_activity: 'ಯಾವುದೇ ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ ಇಲ್ಲ.',
        sms_alerts: 'SMS ಎಚ್ಚರಿಕೆ ವ್ಯವಸ್ಥೆ',
        sms_desc: 'ಬಿಸಿ ಗಾಳಿ, ರೋಗದ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು ಬೆಳೆ ಆರೋಗ್ಯ ನವೀಕರಣಗಳಿಗಾಗಿ ಸ್ವಯಂಚಾಲಿತ ಪಠ್ಯ ಸಂದೇಶಗಳನ್ನು ಸ್ವೀಕರಿಸಿ.',
        notif_center: 'ಅಧಿಸೂಚನೆ ಕೇಂದ್ರ',
        view_all: 'ಎಲ್ಲಾ ಎಚ್ಚರಿಕೆಗಳನ್ನು ನೋಡಿ'
      },
      home: {
        greeting: 'ಶುಭೋದಯ, ರೈತ ರಾಜೇಶ್!',
        tagline: 'ನಿಮ್ಮ ಹೊಲ ಇಂದು ಉತ್ತಮವಾಗಿದೆ.',
        disease_scan: 'ರೋಗ ಪತ್ತೆಹಚ್ಚಿ',
        assistant: 'ಸಹಾಯಕಕ್ಕೆ ಕರೆ ಮಾಡಿ',
        analytics: 'ಮಾಹಿತಿ ವಿಶ್ಲೇಷಣೆ',
        market_prices: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ',
        weather_alert: 'ಉಷ್ಣ ಗಾಳಿಯ ಎಚ್ಚರಿಕೆ: ನೀರಾವರಿ ಹೆಚ್ಚಿಸಿ.',
        disease_warning: 'ರೋಗದ ಎಚ್ಚರಿಕೆ',
        check_now: 'ಈಗಲೇ ಪರೀಕ್ಷಿಸಿ'
      }
    }
  },
  hi: {
    translation: {
      nav: {
        home: 'होम',
        scan: 'स्कैन',
        assistant: 'सहायक',
        analytics: 'विश्लेषण',
        profile: 'प्रोफ़ाइल'
      },
      common: {
        ai_friend: 'कृषि मित्र',
        save_pdf: 'पीडीएफ सहेजें',
        print: 'प्रिंट',
        preparing: 'तैयारी...',
        saving: 'सहेज रहा है...',
        analyzing: 'विश्लेषण कर रहा है...',
        language: 'भाषा',
        done: 'हो गया',
        cancel: 'रद्द करें',
        delete: 'हटाएं',
        mark_read: 'पढ़ा हुआ चिह्नित करें',
        clear: 'साफ़ करें'
      },
      scan: {
        diagnose: 'अपनी फसल का निदान करें',
        upload_desc: 'तत्काल निदान के लिए संक्रमित पत्ते या तने की फोटो लें',
        take_photo: 'फोटो लें',
        gallery: 'गैलरी',
        start_analysis: 'एआई विश्लेषण शुरू करें',
        symptoms: 'दृश्यमान लक्षण',
        treatment: 'विशेषज्ञ उपचार समाधान',
        organic_alt: 'जैविक विकल्प',
        recent_scans: 'हाल के स्कैन'
      },
      analytics: {
        productivity: 'विकास ट्रैकर',
        fertilizer: 'खाद सलाहकार',
        crop_mgmt: 'फसल प्रबंधन',
        select_crop: 'फसल चुनें',
        farmer_details: 'किसान का विवरण',
        generate_report: 'रिपोर्ट तैयार करें',
        growth_stages: 'विकास के चरण',
        calculate: 'खाद सलाह प्राप्त करें'
      },
      assistant: {
        assistant: 'सहायक',
        new_chat: 'नया खेती चैट',
        history: 'चैट इतिहास',
        call_expert: 'विशेषज्ञ को बुलाएं',
        ask_placeholder: 'कृषि सहायक से पूछें...',
        call_dialing: 'डायलिंग...',
        call_active: 'सक्रिय सत्र'
      },
      profile: {
        my_profile: 'मेरी प्रोफ़ाइल',
        farm_info: 'फार्म की जानकारी',
        settings: 'सेटिंग्स',
        portfolio: 'फार्म पोर्टफोलियो',
        total_area: 'कुल क्षेत्रफल',
        primary_crop: 'मुख्य फसल',
        soil_type: 'मिट्टी का प्रकार',
        water_source: 'जल स्रोत',
        verified_account: 'सत्यापित किसान खाता',
        logout: 'लॉगआउट',
        system_settings: 'सिस्टम सेटिंग्स',
        manage_plan: 'योजना प्रबंधित करें',
        notifications: 'अधिसूचना अलर्ट सेटिंग्स (एसएमएस/वॉयस)',
        privacy: 'गोपनीयता और डेटा उपयोग नीतियां',
        version: 'ऐप संस्करण: 2.1.0-VIBRANT',
        activity_log: 'अधिसूचना और गतिविधि लॉग',
        no_activity: 'कोई हालिया गतिविधि नहीं।',
        sms_alerts: 'एसएमएस अलर्ट सिस्टम',
        sms_desc: 'लू, रोग अलर्ट और फसल स्वास्थ्य अपडेट के लिए स्वचालित टेक्स्ट संदेश प्राप्त करें।',
        notif_center: 'अधिसूचना केंद्र',
        view_all: 'सभी अलर्ट देखें'
      },
      home: {
        greeting: 'सुप्रभात, किसान राजेश!',
        tagline: 'आपका खेत आज बहुत अच्छा कर रहा है।',
        disease_scan: 'रोग स्कैन',
        assistant: 'एआई को कॉल करें',
        analytics: 'विश्लेषण',
        market_prices: 'बाजार भाव',
        weather_alert: 'लू की चेतावनी: सिंचाई बढ़ाएं।',
        disease_warning: 'रोग चेतावनी',
        check_now: 'अभी जांच करें'
      }
    }
  },
  te: {
    translation: {
      nav: {
        home: 'హోమ్',
        scan: 'స్కాన్',
        assistant: 'సహాయకుడు',
        analytics: 'విశ్లేషణ',
        profile: 'ప్రొఫైల్'
      },
      common: {
        ai_friend: 'రైతు మిత్రుడు',
        save_pdf: 'PDF సేవ్ చేయండి',
        print: 'ప్రింట్',
        preparing: 'సిద్ధమౌతోంది...',
        saving: 'సేవ్ అవుతోంది...',
        analyzing: 'విశ్లేషిస్తోంది...',
        language: 'భాష',
        done: 'పూర్తయింది',
        cancel: 'రద్దు చేయి',
        delete: 'తొలుగించు',
        mark_read: 'చదివినట్లు గుర్తించు',
        clear: 'క్లియర్ చేయి'
      },
      scan: {
        diagnose: 'పంట వ్యాధిని గుర్తించండి',
        upload_desc: 'తక్షణ విశ్లేషణ కోసం ఫోటో తీయండి',
        take_photo: 'ఫోటో తీయండి',
        gallery: 'గ్యాలరీ',
        start_analysis: 'విశ్లేషణ ప్రారంభించండి',
        symptoms: 'కనిపించే లక్షణాలు',
        treatment: 'నిపుణుల చికిత్స',
        organic_alt: 'సేంద్రియ ప్రత్యామ్నాయం',
        recent_scans: 'ఇటీవలి స్కాన్లు'
      },
      analytics: {
        productivity: 'పెరుగుదల ట్రాకర్',
        fertilizer: 'ఎరువుల సలహాదారు',
        crop_mgmt: 'పంట నిర్వహణ',
        select_crop: 'పంటను ఎంచుకోండి',
        farmer_details: 'రైతు వివరాలు',
        generate_report: 'నివేదికను రూపొందించండి',
        growth_stages: 'పెరుగుదల దశలు',
        calculate: 'ఎరువుల సలహా పొందండి'
      },
      assistant: {
        assistant: 'సహాయకుడు',
        new_chat: 'కొత్త చాట్',
        history: 'చాట్ హిస్టరీ',
        call_expert: 'నిపుణుడికి కాల్ చేయండి',
        ask_placeholder: 'సహాయకుడిని అడగండి...',
        call_dialing: 'డయలింగ్...',
        call_active: 'యాక్టివ్ సెషన్'
      },
      profile: {
        my_profile: 'నా ప్రొఫైల్',
        farm_info: 'పంట సమాచారం',
        settings: 'సెట్టింగ్లు',
        portfolio: 'పంట పోర్ట్‌ఫోలియో',
        total_area: 'మొత్తం విస్తీర్ణం',
        primary_crop: 'ప్రధాన పంట',
        soil_type: 'నేల రకం',
        water_source: 'నీటి వనరు',
        verified_account: 'ధృవీకరించబడిన రైతు ఖాతా',
        logout: 'లాగ్అవుట్',
        system_settings: 'సిస్టమ్ సెట్టింగ్లు',
        manage_plan: 'ప్లాన్ మేనేజ్ చేయండి',
        notifications: 'నోటిఫికేషన్ అలర్ట్ సెట్టింగ్‌లు (SMS/వాయిస్)',
        privacy: 'గోప్యత & డేటా వినియోగ విధానాలు',
        version: 'యాప్ వెర్షన్: 2.1.0-VIBRANT',
        activity_log: 'నోటిఫికేషన్ & యాక్టివిటీ లాగ్',
        no_activity: 'ఇటీవలి కార్యకలాపాలు ఏవీ లేవు.',
        sms_alerts: 'SMS అలర్ట్ సిస్టమ్',
        sms_desc: 'వేడి గాలులు, వ్యాధి హెచ్చరికలు మరియు పంట ఆరోగ్య నవీకరణల కోసం ఆటోమేటిక్ టెక్స్ట్ మెసేజ్‌లను పొందండి.',
        notif_center: 'నోటిఫికేషన్ సెంటర్',
        view_all: 'అన్ని హెచ్చరికలను చూడండి'
      },
      home: {
        greeting: 'శుభోదయం, రైతు రాజేష్!',
        tagline: 'మీ పంట నేడు బాగుంది.',
        disease_scan: 'వ్యాధి స్కాన్',
        assistant: 'కాల్ రైతు మిత్ర',
        analytics: 'విశ్లేషణ',
        market_prices: 'మార్కెట్ ధరలు',
        weather_alert: 'వేడి గాలుల హెచ్చరిక: సాగునీరు పెంచండి.',
        disease_warning: 'వ్యాధి హెచ్చరిక',
        check_now: 'ఇప్పుడే తనిఖీ చేయండి'
      }
    }
  },
  ta: {
    translation: {
      nav: {
        home: 'முகப்பு',
        scan: 'ஸ்கேன்',
        assistant: 'உதவியாளர்',
        analytics: 'பகுப்பாய்வு',
        profile: 'சுயவிவரம்'
      },
      common: {
        ai_friend: 'விவசாய நண்பன்',
        save_pdf: 'PDF சேமி',
        print: 'அச்சிடு',
        preparing: 'தயாராகிறது...',
        saving: 'சேமிக்கப்படுகிறது...',
        analyzing: 'ஆராய்கிறது...',
        language: 'மொழி',
        done: 'முடிந்தது',
        cancel: 'ரத்துசெய்',
        delete: 'நீக்கு',
        mark_read: 'அனைத்தையும் படி',
        clear: 'அழி'
      },
      scan: {
        diagnose: 'பயிர் நோயைக் கண்டறியவும்',
        upload_desc: 'உடனடி கண்டறிதலுக்கு புகைப்படம் எடுக்கவும்',
        take_photo: 'புகைப்படம் எடு',
        gallery: 'கேலரி',
        start_analysis: 'ஆய்வு செய்',
        symptoms: 'அறிகுறிகள்',
        treatment: 'சிகிச்சை முறை',
        organic_alt: 'இயற்கை வழிமுறை',
        recent_scans: 'சமீபத்திய ஆய்வுகள்'
      },
      analytics: {
        productivity: 'வளர்ச்சி கண்காணிப்பு',
        fertilizer: 'உர ஆலோசகர்',
        crop_mgmt: 'பயிர் மேலாண்மை',
        select_crop: 'பயிரைத் தேர்ந்தெடுக்கவும்',
        farmer_details: 'விவசாயி விவரங்கள்',
        generate_report: 'அறிக்கை உருவாக்குக',
        growth_stages: 'வளர்ச்சி நிலைகள்',
        calculate: 'உர பரிந்துரை பெறுக'
      },
      assistant: {
        assistant: 'உதவியாளர்',
        new_chat: 'புதிய உரையாடல்',
        history: 'வரலாறு',
        call_expert: 'நிபுணரை அழைக்கவும்',
        ask_placeholder: 'நிபுணரிடம் கேளுங்கள்...',
        call_dialing: 'அழைக்கிறது...',
        call_active: 'செயலில் உள்ளது'
      },
      profile: {
        my_profile: 'சுயவிவரம்',
        farm_info: 'பண்ணை விவரங்கள்',
        settings: 'அமைப்புகள்',
        portfolio: 'பண்ணை விவரங்கள்',
        total_area: 'மொத்த பரப்பளவு',
        primary_crop: 'முக்கிய பயிர்',
        soil_type: 'மண் வகை',
        water_source: 'நீர் ஆதாரம்',
        verified_account: 'சரிபார்க்கப்பட்ட விவசாயி கணக்கு',
        logout: 'வெளியேறு',
        system_settings: 'அமைப்புகள்',
        manage_plan: 'திட்டத்தை நிர்வகி',
        notifications: 'அறிவிப்பு எச்சரிக்கை அமைப்புகள் (SMS/குரல்)',
        privacy: 'தனியுரிமை மற்றும் தரவு பயன்பாட்டுக் கொள்கைகள்',
        version: 'பயன்பாட்டு பதிப்பு: 2.1.0-VIBRANT',
        activity_log: 'அறிவிப்பு மற்றும் செயல்பாட்டுப் பதிவு',
        no_activity: 'சமீபத்திய செயல்பாடுகள் ஏதுமில்லை.',
        sms_alerts: 'SMS எச்சரிக்கை அமைப்பு',
        sms_desc: 'வெப்ப அலைகள், நோய் எச்சரிக்கைகள் மற்றும் பயிர் சுகாதார அறிவிப்புகளுக்கான தானியங்கி குறுஞ்சెய்திகளைப் பெறுங்கள்.',
        notif_center: 'அறிவிப்பு மையம்',
        view_all: 'அனைத்தையும் காண்க'
      },
      home: {
        greeting: 'காலை வணக்கம், விவசாயி ராஜேஷ்!',
        tagline: 'உங்கள் பண்ணை இன்று சிறப்பாக உள்ளது.',
        disease_scan: 'நோய் கண்டறிதல்',
        assistant: 'நிபுணரை அழைக்கவும்',
        analytics: 'பகுப்பாய்வு',
        market_prices: 'சந்தை நிலவரம்',
        weather_alert: 'வெப்ப அலை எச்சரிக்கை: நீர் பாய்ச்சலை அதிகரிக்கவும்.',
        disease_warning: 'நோய் எச்சரிக்கை',
        check_now: 'இப்போதே சரிபார்க்கவும்'
      }
    }
  },
  ml: {
    translation: {
      nav: {
        home: 'ഹോം',
        scan: 'സ്കാൻ',
        assistant: 'സഹായി',
        analytics: 'വിശകലനം',
        profile: 'പ്രൊഫൈൽ'
      },
      common: {
        ai_friend: 'കൃഷി സഹായി',
        save_pdf: 'PDF സേവ് ചെയ്യുക',
        print: 'പ്രിന്റ്',
        preparing: 'തയ്യാറെടുക്കുന്നു...',
        saving: 'സേവ് ചെയ്യുന്നു...',
        analyzing: 'വിശകലനം ചെയ്യുന്നു...',
        language: 'ഭാഷ',
        done: 'കഴിഞ്ഞു',
        cancel: 'റദ്ദാക്കുക',
        delete: 'ഡിലീറ്റ് ചെയ്യുക',
        mark_read: 'വായിച്ചതായി അടയാളപ്പെടുത്തുക',
        clear: 'ശൂന്യമാക്കുക'
      },
      scan: {
        diagnose: 'വിളരോഗം കണ്ടെത്തുക',
        upload_desc: 'വിശകലനത്തിനായി ഫോട്ടോ എടുക്കുക',
        take_photo: 'ഫോട്ടോ എടുക്കുക',
        gallery: 'ഗാലറി',
        start_analysis: 'വിശകലനം തുടങ്ങുക',
        symptoms: 'ലക്ഷണങ്ങൾ',
        treatment: 'ചികിത്സാ മാർഗ്ഗം',
        organic_alt: 'ജൈവ രീതി',
        recent_scans: 'സമീപകാല സ്കാനുകൾ'
      },
      analytics: {
        productivity: 'വളർച്ചാ നിരീക്ഷണം',
        fertilizer: 'വള ഉപദേശകൻ',
        crop_mgmt: 'കൃഷി പരിപാലനം',
        select_crop: 'വിള തിരഞ്ഞെടുക്കുക',
        farmer_details: 'കർഷക വിവരങ്ങൾ',
        generate_report: 'റിപ്പോർട്ട് തയ്യാറാക്കുക',
        growth_stages: 'വളർച്ചാ ഘട്ടങ്ങൾ',
        calculate: 'വള നിർദ്ദേശം നേടുക'
      },
      assistant: {
        assistant: 'സഹായി',
        new_chat: 'പുതിയ ചാറ്റ്',
        history: 'ചാറ്റ് ചരിത്രം',
        call_expert: 'വിദഗ്ധനെ വിളിക്കുക',
        ask_placeholder: 'സഹായിയോട് ചോദിക്കുക...',
        call_dialing: 'വിളിക്കുന്നു...',
        call_active: 'സജീവ സെഷൻ'
      },
      profile: {
        my_profile: 'എന്റെ പ്രൊഫൈൽ',
        farm_info: 'കൃഷി വിവരങ്ങൾ',
        settings: 'സെറ്റിംഗ്സ്',
        portfolio: 'കൃഷി വിവരങ്ങൾ',
        total_area: 'ആകെ വിസ്തീർണ്ണം',
        primary_crop: 'പ്രധാന വിള',
        soil_type: 'മണ്ണിന്റെ തരം',
        water_source: 'ജല സ്രോതസ്സ്',
        verified_account: 'പരിശോധിച്ച കർഷക അക്കൗണ്ട്',
        logout: 'ലോഗൗട്ട്',
        system_settings: 'സിസ്റ്റം സെറ്റിംഗ്സ്',
        manage_plan: 'പ്ലാൻ നിയന്ത്രിക്കുക',
        notifications: 'അറിയിപ്പ് അലേർട്ട് ക്രമീകരണങ്ങൾ (SMS/വോയിസ്)',
        privacy: 'സ്വകാര്യതാ നയങ്ങൾ',
        version: 'ആപ്പ് പതിപ്പ്: 2.1.0-VIBRANT',
        activity_log: 'അറിയിപ്പ് & പ്രവർത്തന ലോഗ്',
        no_activity: 'സമീപകാല പ്രവർത്തനങ്ങളൊന്നുമില്ല.',
        sms_alerts: 'SMS അലേർട്ട് സിസ്റ്റം',
        sms_desc: 'ഉഷ്ണതരംഗം, രോഗ മുന്നറിയിപ്പുകൾ, വിള ആരോഗ്യ അപ്ഡേറ്റുകൾ എന്നിവയ്ക്കായി ഓട്ടോമാറ്റിക് ടെക്സ്റ്റ് സന്ദേശങ്ങൾ സ്വീകരിക്കുക.',
        notif_center: 'നോട്ടിഫിക്കേഷൻ സെന്റർ',
        view_all: 'എല്ലാ അലേർട്ടുകളും കാണുക'
      },
      home: {
        greeting: 'സുപ്രഭാതം, കർഷകൻ രാജേഷ്!',
        tagline: 'നിങ്ങളുടെ കൃഷി ഇന്ന് മികച്ച നിലയിലാണ്.',
        disease_scan: 'രോഗ സ്കാനിംഗ്',
        assistant: 'സഹായിയെ വിളിക്കുക',
        analytics: 'വിശകലനം',
        market_prices: 'വിപണി വിലനിലവാരം',
        weather_alert: 'ഉഷ്ണതരംഗ മുന്നറിയിപ്പ്: നന വർദ്ധിപ്പിക്കുക.',
        disease_warning: 'രോഗ മുന്നറിയിപ്പ്',
        check_now: 'ഇപ്പോൾ പരിശോധിക്കുക'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
