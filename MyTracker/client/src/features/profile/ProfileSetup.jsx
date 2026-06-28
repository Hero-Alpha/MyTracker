import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../shared/services/api';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';

const STEPS = ['Personal', 'Body', 'Goals'];

const ACTIVITY_OPTIONS = [
  { value: 'sedentary',   label: 'Sedentary',    desc: 'Little or no exercise' },
  { value: 'light',       label: 'Light',         desc: '1–3 days/week' },
  { value: 'moderate',    label: 'Moderate',      desc: '3–5 days/week' },
  { value: 'active',      label: 'Active',        desc: '6–7 days/week' },
  { value: 'very_active', label: 'Very Active',   desc: 'Physical job or 2x/day' },
];

const GOAL_OPTIONS = [
  { value: 'lose_weight',  label: 'Lose Weight' },
  { value: 'maintain',     label: 'Maintain Weight' },
  { value: 'gain_muscle',  label: 'Gain Muscle' },
];

export default function ProfileSetup() {
  const { updateUser } = useAuth();
  const navigate       = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const [form, setForm] = useState({
    age: '', gender: '', height: '', heightUnit: 'cm',
    currentWeight: '', targetWeight: '',
    activityLevel: '', goal: '',
  });

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function submit() {
    setLoading(true);
    setError('');
    try {
      const res = await api.put('/profile', {
        age:           Number(form.age),
        gender:        form.gender,
        height:        { value: Number(form.height), unit: form.heightUnit },
        currentWeight: Number(form.currentWeight),
        targetWeight:  Number(form.targetWeight),
        activityLevel: form.activityLevel,
        goal:          form.goal,
      });
      updateUser(res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Set up your profile</h1>
          <p className="text-sm text-gray-500 mt-1">We use this to calculate your nutrition targets</p>

          <div className="flex gap-2 mt-6">
            {STEPS.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1 rounded-full transition-colors ${i <= step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                <span className="text-xs text-gray-500 mt-1 block">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {step === 0 && (
          <div className="flex flex-col gap-4">
            <Input label="Age" type="number" value={form.age} onChange={e => set('age', e.target.value)} min="10" max="100" />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <div className="flex gap-2">
                {['male', 'female', 'other'].map(g => (
                  <button key={g} type="button"
                    onClick={() => set('gender', g)}
                    className={`flex-1 py-2 rounded-lg border text-sm capitalize transition-colors
                      ${form.gender === g ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <Input label="Height" type="number" value={form.height} onChange={e => set('height', e.target.value)} className="flex-1" />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Unit</label>
                <select value={form.heightUnit} onChange={e => set('heightUnit', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </select>
              </div>
            </div>
            <Input label="Current Weight (kg)" type="number" value={form.currentWeight} onChange={e => set('currentWeight', e.target.value)} />
            <Input label="Target Weight (kg)" type="number" value={form.targetWeight} onChange={e => set('targetWeight', e.target.value)} />
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Activity Level</label>
              {ACTIVITY_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => set('activityLevel', opt.value)}
                  className={`flex justify-between items-center px-4 py-3 rounded-lg border text-left transition-colors
                    ${form.activityLevel === opt.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <span className="font-medium text-sm text-gray-800">{opt.label}</span>
                  <span className="text-xs text-gray-500">{opt.desc}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Goal</label>
              <div className="flex gap-2">
                {GOAL_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => set('goal', opt.value)}
                    className={`flex-1 py-3 rounded-lg border text-sm transition-colors
                      ${form.goal === opt.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

        <div className="flex justify-between mt-8">
          {step > 0
            ? <Button variant="secondary" onClick={() => setStep(s => s - 1)}>Back</Button>
            : <div />
          }
          {step < STEPS.length - 1
            ? <Button onClick={() => setStep(s => s + 1)}>Next</Button>
            : <Button onClick={submit} loading={loading}>Finish</Button>
          }
        </div>
      </div>
    </div>
  );
}
