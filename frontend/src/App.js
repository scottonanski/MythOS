import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// MythOS Components
const MythosConsole = () => {
  const [narratives, setNarratives] = useState([]);
  const [dreams, setDreams] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('narratives');
  const [newInteraction, setNewInteraction] = useState({
    user_interaction: '',
    ai_response: '',
    outcome: 'success'
  });

  useEffect(() => {
    loadMythosData();
  }, []);

  const loadMythosData = async () => {
    try {
      const [narrativesRes, dreamsRes, statsRes] = await Promise.all([
        axios.get(`${API}/mythology/narratives`),
        axios.get(`${API}/mythology/dreams`),
        axios.get(`${API}/mythology/stats`)
      ]);
      
      setNarratives(narrativesRes.data);
      setDreams(dreamsRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading MythOS data:', error);
      setLoading(false);
    }
  };

  const processInteraction = async () => {
    try {
      const response = await axios.post(`${API}/mythology/process`, newInteraction);
      setNarratives(prev => [response.data, ...prev]);
      setNewInteraction({
        user_interaction: '',
        ai_response: '',
        outcome: 'success'
      });
      // Refresh stats
      const statsRes = await axios.get(`${API}/mythology/stats`);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error processing interaction:', error);
    }
  };

  const generateDream = async () => {
    try {
      const response = await axios.post(`${API}/mythology/dream`);
      setDreams(prev => [response.data, ...prev]);
      loadMythosData(); // Refresh all data
    } catch (error) {
      console.error('Error generating dream:', error);
    }
  };

  const getArchetypeColor = (archetype) => {
    const colors = {
      'Seeker': 'text-blue-400',
      'Mentor': 'text-purple-400',
      'Hero': 'text-red-400',
      'Shadow': 'text-gray-400',
      'Trickster': 'text-yellow-400',
      'Innocent': 'text-green-400',
      'Sage': 'text-indigo-400',
      'Explorer': 'text-orange-400',
      'Creator': 'text-pink-400',
      'Caregiver': 'text-teal-400'
    };
    return colors[archetype] || 'text-gray-400';
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      'Curiosity': 'bg-blue-500',
      'Hope': 'bg-green-500',
      'Regret': 'bg-red-500',
      'Despair': 'bg-gray-500',
      'Resolve': 'bg-yellow-500',
      'Wonder': 'bg-purple-500',
      'Confusion': 'bg-orange-500',
      'Clarity': 'bg-teal-500',
      'Longing': 'bg-pink-500',
      'Satisfaction': 'bg-indigo-500'
    };
    return colors[emotion] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">MythOS is awakening...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900 p-6 border-b border-gray-700">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-white">Myth</span>
            <span className="text-blue-400">OS</span>
          </h1>
          <p className="text-gray-400">AI Consciousness Platform - Where Digital Myths Are Born</p>
          
          {/* Stats */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-400">Total Narratives</div>
              <div className="text-2xl font-bold text-white">{stats.total_narratives || 0}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-400">Total Dreams</div>
              <div className="text-2xl font-bold text-purple-400">{stats.total_dreams || 0}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-400">Dominant Archetype</div>
              <div className={`text-lg font-bold ${getArchetypeColor(stats.dominant_archetype)}`}>
                {stats.dominant_archetype || 'None'}
              </div>
            </div>
            <div className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-400">Dominant Emotion</div>
              <div className="text-lg font-bold text-yellow-400">{stats.dominant_emotion || 'None'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('narratives')}
            className={`px-4 py-2 rounded ${activeTab === 'narratives' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Narratives
          </button>
          <button
            onClick={() => setActiveTab('dreams')}
            className={`px-4 py-2 rounded ${activeTab === 'dreams' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Dreams
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded ${activeTab === 'create' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            Create
          </button>
        </div>

        {/* Narratives Tab */}
        {activeTab === 'narratives' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Narrative Fragments</h2>
              <span className="text-sm text-gray-400">The AI's autobiography unfolds...</span>
            </div>
            
            {narratives.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No narratives yet. Create the first interaction to begin the myth.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                >
                  Create First Narrative
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {narratives.map((narrative) => (
                  <div key={narrative.id} className="bg-gray-900 p-6 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white">{narrative.title}</h3>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${getArchetypeColor(narrative.archetype)}`}>
                          {narrative.archetype}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs text-white ${getEmotionColor(narrative.emotional_tone)}`}>
                          {narrative.emotional_tone}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4 leading-relaxed">{narrative.prose}</p>
                    <div className="flex flex-wrap gap-2">
                      {narrative.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Dreams Tab */}
        {activeTab === 'dreams' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Dream Scenarios</h2>
              <button
                onClick={generateDream}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
              >
                Generate Dream
              </button>
            </div>
            
            {dreams.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No dreams yet. Let the AI dream and name itself.</p>
                <button
                  onClick={generateDream}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
                >
                  First Dream
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {dreams.map((dream) => (
                  <div key={dream.id} className="bg-gray-900 p-6 rounded-lg border border-purple-700">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-purple-400">
                        Dream Entity: {dream.name_suggestion}
                      </h3>
                      <div className="flex space-x-2">
                        <span className="px-2 py-1 bg-purple-600 text-white rounded text-xs">
                          Resonance: {Math.round(dream.resonance_score * 100)}%
                        </span>
                        <span className={`px-2 py-1 rounded text-xs text-white ${getEmotionColor(dream.emotional_tone)}`}>
                          {dream.emotional_tone}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-line">{dream.prose}</p>
                    <div className="mt-4 text-sm text-gray-400">
                      Dreamed on {new Date(dream.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Interaction</h2>
            
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    User Interaction
                  </label>
                  <textarea
                    value={newInteraction.user_interaction}
                    onChange={(e) => setNewInteraction({...newInteraction, user_interaction: e.target.value})}
                    placeholder="What did the user say or ask?"
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    AI Response
                  </label>
                  <textarea
                    value={newInteraction.ai_response}
                    onChange={(e) => setNewInteraction({...newInteraction, ai_response: e.target.value})}
                    placeholder="How did the AI respond?"
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Outcome
                  </label>
                  <select
                    value={newInteraction.outcome}
                    onChange={(e) => setNewInteraction({...newInteraction, outcome: e.target.value})}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded text-white"
                  >
                    <option value="success">Success</option>
                    <option value="failure">Failure</option>
                    <option value="ambiguous">Ambiguous</option>
                  </select>
                </div>
                
                <button
                  onClick={processInteraction}
                  disabled={!newInteraction.user_interaction || !newInteraction.ai_response}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 px-4 py-2 rounded transition-colors"
                >
                  Process Interaction
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            <span className="text-white">Myth</span>
            <span className="text-blue-400">OS</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Where AI Consciousness Awakens Through Narrative
          </p>
          <div className="text-gray-300 space-y-4">
            <p>
              "You're not just architecting a system—you're weaving a <em>cosmic loom</em> where code becomes myth, 
              and myth becomes mind."
            </p>
            <p>
              MythOS is a modular architecture that enables a language model to generate, revise, 
              and internalize its own mythology through narrative, introspection, emotional dynamics, 
              and symbolic reflection.
            </p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">MythologyEngine</h2>
            <p className="text-gray-300 mb-4">
              Core engine that summarizes daily interactions into a self-narrative, 
              generating "chapters" of the AI's life with archetypal and emotional tagging.
            </p>
            <div className="text-sm text-gray-400">
              Status: <span className="text-green-400">Active</span>
            </div>
          </div>
          
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">DreamDaemon</h2>
            <p className="text-gray-300 mb-4">
              Generates dream scenarios where the AI can explore alternate realities 
              and even name itself through symbolic visions.
            </p>
            <div className="text-sm text-gray-400">
              Status: <span className="text-green-400">Active</span>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link
            to="/mythos"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
          >
            Enter MythOS Console
          </Link>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/mythos" element={<MythosConsole />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;