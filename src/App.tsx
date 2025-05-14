import image from './assets/0-floor.png';
import svgOverlay from './assets/0-floor.svg';
import data from './assets/data.json';
import { useEffect, useState, useRef } from 'react';

type Status = 'available' | 'reserved' | 'sold' | 'all';
type PolygonData = {
  code: number;
  status: 'available' | 'reserved' | 'sold';
  price: number;
};

function App() {

  const [statusFilter, setStatusFilter] = useState<Status>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(100000);
  const [hoveredPolygon, setHoveredPolygon] = useState<PolygonData | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  
  const minDataPrice = Math.min(...data.map(item => item.price));
  const maxDataPrice = Math.max(...data.map(item => item.price));
  
  useEffect(() => {
    const loadSvgAndApplyFilters = async () => {
      if (!svgContainerRef.current) return;
      
      try {
        const response = await fetch(svgOverlay);
        const svgText = await response.text();
        svgContainerRef.current.innerHTML = svgText;
        
        const svgElement = svgContainerRef.current.querySelector('svg');
        if (!svgElement) return;
        
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');
        
        applyFilters();
        addHoverEffects();
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };
    
    loadSvgAndApplyFilters();
  }, [statusFilter, minPrice, maxPrice]);
  
  const applyFilters = () => {
    if (!svgContainerRef.current) return;
    
    const polygons = svgContainerRef.current.querySelectorAll('polygon');
    
    polygons.forEach(polygon => {
      const code = polygon.getAttribute('data-code');
      const polygonData = data.find(item => item.code === Number(code));
      
      if (polygonData) {
        const statusMatch = statusFilter === 'all' || polygonData.status === statusFilter;
        const priceMatch = polygonData.price >= minPrice && polygonData.price <= maxPrice;
        
        if (statusMatch && priceMatch) {
          polygon.style.display = 'block';
          switch (polygonData.status) {
            case 'available':
              polygon.setAttribute('fill', '#4CAF50');
              break;
            case 'reserved':
              polygon.setAttribute('fill', '#FF9800');
              break;
            case 'sold':
              polygon.setAttribute('fill', '#F44336');
              break;
          }
        } else {
          polygon.style.display = 'none';
        }
      }
    });
  };

  const addHoverEffects = () => {
    if (!svgContainerRef.current) return;
    
    const polygons = svgContainerRef.current.querySelectorAll('polygon');

    polygons.forEach(polygon => {
      const code = polygon.getAttribute('data-code');
      const polygonData = data.find(item => item.code === Number(code)) as PolygonData | undefined;

      if (polygonData) {
        polygon.addEventListener('mouseenter', () => {
          setHoveredPolygon(polygonData);
          polygon.setAttribute('stroke', '#000000');
          polygon.setAttribute('stroke-width', '2');
        });
        polygon.addEventListener('mouseleave', () => {
          setHoveredPolygon(null);
          polygon.removeAttribute('stroke');
          polygon.removeAttribute('stroke-width');
        });
      }
    });
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 100,
        width: '250px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0 }}>Filters</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Status)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="all">All</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Price Range:</label>
          <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
            ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Min:</label>
              <input
                type="number"
                value={minPrice}
                min={minDataPrice}
                max={maxDataPrice}
                onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
                style={{ width: '90%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9em' }}>Max:</label>
              <input
                type="number"
                value={maxPrice}
                min={minDataPrice}
                max={maxDataPrice}
                onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
                style={{ width: '90%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: '5px' }}>
            <input
              type="range"
              min={minDataPrice}
              max={maxDataPrice}
              value={minPrice}
              onChange={(e) => setMinPrice(Math.min(Number(e.target.value), maxPrice))}
              style={{ width: '100%', marginBottom: '15px' }}
            />
            <input
              type="range"
              min={minDataPrice}
              max={maxDataPrice}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Math.max(Number(e.target.value), minPrice))}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
      
      {hoveredPolygon && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '15px',
          borderRadius: '8px',
          zIndex: 100,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          maxWidth: '250px'
        }}>
          <h3 style={{ marginTop: 0 }}>Unit #{hoveredPolygon.code}</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Status:</strong> 
            <span style={{ 
              color: hoveredPolygon.status === 'available' ? '#4CAF50' : 
                     hoveredPolygon.status === 'reserved' ? '#FF9800' : '#F44336',
              textTransform: 'capitalize',
              marginLeft: '5px'
            }}>
              {hoveredPolygon.status}
            </span>
          </div>
          <div>
            <strong>Price:</strong> ${hoveredPolygon.price.toLocaleString()}
          </div>
        </div>
      )}
      
      <img style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: '#272727',
        objectFit: 'contain'
      }} src={image} alt="Floor plan" />
      
      <div 
        ref={svgContainerRef} 
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
      
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '15px',
        borderRadius: '8px',
        zIndex: 100,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Legend</h4>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#4CAF50', 
            marginRight: '10px',
            borderRadius: '3px'
          }}></div>
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#FF9800', 
            marginRight: '10px',
            borderRadius: '3px'
          }}></div>
          <span>Reserved</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#F44336', 
            marginRight: '10px',
            borderRadius: '3px'
          }}></div>
          <span>Sold</span>
        </div>
      </div>
    </>
  )
}

export default App
