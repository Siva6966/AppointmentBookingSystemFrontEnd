// Author: Cva
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import './styles.css';

function App() {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [slots, setSlots] = useState([]);
  const [appointment, setAppointment] = useState({ customerName: '', customerEmail: '', paymentMode: 'PAY_AT_OFFICE' });
  const [message, setMessage] = useState('');

  useEffect(() => { fetch('/api/providers').then(r=>r.json()).then(setProviders); }, []);

  useEffect(() => {
    if (selectedProvider) {
      fetch(`/api/slots/provider/${selectedProvider.id}`).then(r=>r.json()).then(setSlots);
    }
  }, [selectedProvider]);

  const selectSlot = (slot) => {
    setAppointment({ ...appointment, slot: { id: slot.id }, provider: { id: selectedProvider.id } });
  };

  const book = async () => {
    if (!appointment.customerName || !appointment.customerEmail || !appointment.slot) {
      setMessage('Please enter name, email and select a slot.');
      return;
    }
    const res = await fetch('/api/appointments/book', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(appointment)
    });
    if (res.ok) {
      const data = await res.json();
      setMessage('Appointment booked successfully (Pay at Office).');
      setAppointment({ customerName:'', customerEmail:'', paymentMode:'PAY_AT_OFFICE' });
      setSlots(slots.filter(s => s.id !== appointment.slot.id));
    } else {
      const err = await res.text();
      setMessage('Booking failed: ' + err);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Appointment Booking System <small>— Cva</small></h1>
      </header>

      <section className="panel">
        <h2>Providers</h2>
        <div className="providers">
          {providers.map(p => (
            <div key={p.id} className={"provider " + (selectedProvider && selectedProvider.id===p.id ? 'active':'')}
                 onClick={() => setSelectedProvider(p)}>
              <h3>{p.name}</h3>
              <p className="muted">{p.type}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Available Slots {selectedProvider ? `for ${selectedProvider.name}`: ''}</h2>
        {!selectedProvider && <p className="muted">Select a provider to see available slots.</p>}
        {selectedProvider && (
          <div className="slots">
            {slots.length===0 && <p>No slots available.</p>}
            {slots.map(s => (
              <div key={s.id} className="slot" onClick={() => selectSlot(s)}>
                <div>{format(parseISO(s.startTime), 'MMM d, yyyy HH:mm')}</div>
                <div className="small">{format(parseISO(s.endTime), 'HH:mm')}</div>
            </div>
            ))}
          </div>
        )}
      </section>

  <section className="panel">
    <h2>Book Appointment</h2>
    <div className="form">
      <input type="text" placeholder="Full name" value={appointment.customerName} onChange={e=>setAppointment({...appointment, customerName:e.target.value})} />
      <input type="email" placeholder="Email" value={appointment.customerEmail} onChange={e=>setAppointment({...appointment, customerEmail:e.target.value})} />
      <div className="row">
        <button className="primary" onClick={book}>Confirm Booking (Pay at Office)</button>
      </div>
      {message && <p className="message">{message}</p>}
    </div>
  </section>
</div>
  );
}

export default App;
