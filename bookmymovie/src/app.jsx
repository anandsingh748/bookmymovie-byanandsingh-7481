import React, { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LoginModal, RegisterModal } from './components/AuthModals'

const API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page_size=40&page='
const HOLLYWOOD_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&with_original_language=en&page_size=40&page='
const BOLLYWOOD_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&with_original_language=hi&release_date.gte=2023-01-01&page_size=40&page='
const TAMIL_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&with_original_language=ta&release_date.gte=2023-01-01&page_size=40&page='
const TELUGU_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&with_original_language=te&release_date.gte=2023-01-01&page_size=40&page='
const TOP_RATED_URL = 'https://api.themoviedb.org/3/movie/top_rated?api_key=3fd2be6f0c70a2a598f084ddfb75487c&page_size=40&page='
const UPCOMING_URL = 'https://api.themoviedb.org/3/movie/upcoming?api_key=3fd2be6f0c70a2a598f084ddfb75487c&page_size=40&page='
const NOW_PLAYING_URL = 'https://api.themoviedb.org/3/movie/now_playing?api_key=3fd2be6f0c70a2a598f084ddfb75487c&page_size=40&page='
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280'
const SEARCH_API = 'https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query='
const TICKET_PRICE = 1080

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [movies, setMovies] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [currentSearch, setCurrentSearch] = useState('')
  const [movieType, setMovieType] = useState('all')
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('favorites')) || [])
  const [showLoading, setShowLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPagination, setShowPagination] = useState(true)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [showStreaming, setShowStreaming] = useState(false)
  const [streamingMovies, setStreamingMovies] = useState([])
  const [selectedProvider, setSelectedProvider] = useState('all')
  
  // Auth Modal states
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [showFavoritesModal, setShowFavoritesModal] = useState(false)
  const [showTrailerModal, setShowTrailerModal] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [trailerKey, setTrailerKey] = useState('')
  const [streamingOptions, setStreamingOptions] = useState([])
  
  // Booking state
  const [numTickets, setNumTickets] = useState(1)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const [showTime, setShowTime] = useState('')
  const [selectedDate, setSelectedDate] = useState(1)
  
  const searchRef = useRef(null)
  const mainRef = useRef(null)
  const ticketRef = useRef(null)

  useEffect(() => {
    getMovies(API_URL + currentPage)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  async function getMovies(url) {
    setShowLoading(true)
    setError('')
    
    try {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error('Failed to fetch movies')
      }
      const data = await res.json()
      
      if (data.results.length === 0) {
        setError('No movies found. Try a different search.')
        setShowPagination(false)
      } else {
        setMovies(data.results)
        if (!currentSearch) {
          setShowPagination(true)
        }
      }
    } catch (err) {
      setError('Oops! Something went wrong. Please try again later.')
      console.error('Error:', err)
    } finally {
      setShowLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    const searchTerm = searchRef.current.value
    if (searchTerm && searchTerm !== '') {
      setCurrentSearch(searchTerm)
      setCurrentPage(1)
      getMovies(SEARCH_API + searchTerm)
      searchRef.current.value = ''
      setShowPagination(false)
    } else {
      setCurrentSearch('')
      setCurrentPage(1)
      loadMoviesByType(movieType)
      setShowPagination(true)
    }
  }

  function loadMoviesByType(type) {
    let url
    switch (type) {
      case 'hollywood':
        url = HOLLYWOOD_URL + currentPage
        break
      case 'bollywood':
        url = BOLLYWOOD_URL + currentPage
        break
      case 'tamil':
        url = TAMIL_URL + currentPage
        break
      case 'telugu':
        url = TELUGU_URL + currentPage
        break
      case 'toprated':
        url = TOP_RATED_URL + currentPage
        break
      case 'upcoming':
        url = UPCOMING_URL + currentPage
        break
      case 'nowplaying':
        url = NOW_PLAYING_URL + currentPage
        break
      default:
        url = API_URL + currentPage
    }
    getMovies(url)
  }

  function handleMovieTypeChange(type) {
    setMovieType(type)
    setCurrentPage(1)
    setCurrentSearch('')
    loadMoviesByType(type)
    scrollToTop()
  }

  function handlePrevPage() {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      if (currentSearch) {
        getMovies(SEARCH_API + currentSearch + '&page=' + newPage)
      } else {
        loadMoviesByType(movieType)
      }
      scrollToTop()
    }
  }

  function handleNextPage() {
    const newPage = currentPage + 1
    setCurrentPage(newPage)
    if (currentSearch) {
      getMovies(SEARCH_API + currentSearch + '&page=' + newPage)
    } else {
      loadMoviesByType(movieType)
    }
    scrollToTop()
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  function toggleFavorite(movie) {
    const index = favorites.findIndex(f => f.id === movie.id)
    if (index === -1) {
      setFavorites([...favorites, movie])
    } else {
      setFavorites(favorites.filter(f => f.id !== movie.id))
    }
  }

  function isFavorite(movieId) {
    return favorites.some(f => f.id === movieId)
  }

  function getClassByRate(vote) {
    if (vote >= 8) return 'green'
    if (vote >= 5) return 'orange'
    return 'red'
  }

  function getRatingText(vote) {
    if (vote >= 8) return 'Excellent!'
    if (vote >= 7) return 'Great'
    if (vote >= 6) return 'Good'
    if (vote >= 5) return 'Average'
    if (vote >= 4) return 'Below Average'
    if (vote >= 3) return 'Poor'
    return 'Bad'
  }

  function showMovieDetails(movie) {
    setSelectedMovie(movie)
    setShowModal(true)
    document.body.style.overflow = 'hidden'
  }

  function closeModal() {
    setShowModal(false)
    setSelectedMovie(null)
    document.body.style.overflow = 'auto'
  }

  function showFavorites() {
    setShowFavoritesModal(true)
    document.body.style.overflow = 'hidden'
  }

  function closeFavoritesModal() {
    setShowFavoritesModal(false)
    document.body.style.overflow = 'auto'
  }

  async function loadStreamingMovies() {
    setShowStreaming(true)
    setShowLoading(true)
    
    try {
      const res = await fetch(API_URL + '1')
      const data = await res.json()
      
      const moviesWithProviders = await Promise.all(
        data.results.slice(0, 20).map(async (movie) => {
          try {
            const watchRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/watch/providers?api_key=3fd2be6f0c70a2a598f084ddfb75487c`)
            const watchData = await watchRes.json()
            const providers = watchData.results && watchData.results.US ? watchData.results.US : null
            return { ...movie, providers }
          } catch (e) {
            return { ...movie, providers: null }
          }
        })
      )
      
      const streamingAvailable = moviesWithProviders.filter(m => m.providers && (m.providers.flatrate || m.providers.rent || m.providers.buy))
      setStreamingMovies(streamingAvailable)
    } catch (error) {
      console.error('Error loading streaming movies:', error)
    } finally {
      setShowLoading(false)
    }
  }

  function closeStreaming() {
    setShowStreaming(false)
  }

  function filterStreamingMovies(provider) {
    setSelectedProvider(provider)
  }

  function getFilteredStreamingMovies() {
    if (selectedProvider === 'all') return streamingMovies
    
    const providerIds = {
      'netflix': 8,
      'prime': 9,
      'disney': 337,
      'hulu': 15,
      'hbomax': 5
    }
    
    const targetId = providerIds[selectedProvider]
    
    return streamingMovies.filter(m => {
      if (!m.providers) return false
      const all = [...(m.providers.flatrate || []), ...(m.providers.rent || []), ...(m.providers.buy || [])]
      return all.some(p => p.provider_id === targetId)
    })
  }

  function getProviderClass(providerId) {
    const providerMap = { 8: 'netflix', 9: 'prime', 337: 'disney', 15: 'hulu', 5: 'hbomax' }
    return providerMap[providerId] || 'other'
  }

  async function showStreamingOptions(movie) {
    setShowModal(false)
    setShowLoading(true)
    
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/watch/providers?api_key=3fd2be6f0c70a2a598f084ddfb75487c`)
      const data = await res.json()
      const usProviders = data.results && data.results.US
      
      if (!usProviders) {
        setStreamingOptions([])
        setShowTrailerModal(true)
        return
      }
      
      const flatrate = usProviders.flatrate || []
      const rent = usProviders.rent || []
      const buy = usProviders.buy || []
      
      const allOptions = [...flatrate, ...rent, ...buy]
      setStreamingOptions(allOptions)
      setShowTrailerModal(true)
    } catch (error) {
      console.error('Error fetching streaming options:', error)
      setStreamingOptions([])
      setShowTrailerModal(true)
    } finally {
      setShowLoading(false)
    }
  }

  function getProviderLink(providerId, movieTitle) {
    const encodedTitle = encodeURIComponent(movieTitle)
    const providerLinks = {
      8: `https://www.netflix.com/search?q=${encodedTitle}`,
      9: `https://www.amazon.com/s?k=${encodedTitle}`,
      337: `https://www.disneyplus.com/search?q=${encodedTitle}`,
      15: `https://www.hulu.com/search?q=${encodedTitle}`,
      5: `https://www.max.com/search?q=${encodedTitle}`
    }
    return providerLinks[providerId] || `https://www.google.com/search?q=${encodeURIComponent(movieTitle + " movie stream")}`
  }

  async function showTrailer(movie) {
    setShowModal(false)
    setShowTrailerModal(true)
    setStreamingOptions([])
    setShowLoading(true)
    
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=3fd2be6f0c70a2a598f084ddfb75487c`)
      const data = await res.json()
      const trailer = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube')
      
      if (trailer) {
        setTrailerKey(trailer.key)
      } else {
        setTrailerKey(null)
      }
    } catch (error) {
      console.error('Error fetching trailer:', error)
      setTrailerKey(null)
    } finally {
      setShowLoading(false)
    }
  }

  function closeTrailerModal() {
    setShowTrailerModal(false)
    setTrailerKey('')
    setStreamingOptions([])
    document.body.style.overflow = 'auto'
  }

  function openBookingModal(movie) {
    setSelectedMovie(movie)
    setNumTickets(1)
    setSelectedSeats([])
    setOccupiedSeats(generateOccupiedSeats())
    setShowTime('')
    setSelectedDate(1)
    setShowModal(false)
    setShowBookingModal(true)
    document.body.style.overflow = 'hidden'
  }

  function closeBookingModal() {
    setShowBookingModal(false)
    setSelectedSeats([])
    document.body.style.overflow = ''
  }

  function generateOccupiedSeats() {
    const occupied = []
    const numOccupied = Math.floor(Math.random() * 10) + 5
    
    while (occupied.length < numOccupied) {
      const row = String.fromCharCode(65 + Math.floor(Math.random() * 6))
      const seat = Math.floor(Math.random() * 8) + 1
      const seatNumber = `${row}${seat}`
      if (!occupied.includes(seatNumber)) {
        occupied.push(seatNumber)
      }
    }
    return occupied
  }

  function toggleSeat(seatNumber) {
    if (occupiedSeats.includes(seatNumber)) return
    
    const index = selectedSeats.indexOf(seatNumber)
    if (index === -1) {
      if (selectedSeats.length < numTickets) {
        setSelectedSeats([...selectedSeats, seatNumber])
      }
    } else {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber))
    }
  }

  function handleTicketsChange(delta) {
    const newCount = numTickets + delta
    if (newCount >= 1 && newCount <= 10) {
      setNumTickets(newCount)
      if (selectedSeats.length > newCount) {
        setSelectedSeats(selectedSeats.slice(0, newCount))
      }
    }
  }

  function handleBookingSubmit(e) {
    e.preventDefault()
    
    if (!showTime) {
      alert('Please select a show time')
      return
    }
    
    if (selectedSeats.length !== numTickets) {
      alert(`Please select ${numTickets} seat(s)`)
      return
    }
    
    setShowBookingModal(false)
    setShowSuccessModal(true)
  }

  function closeSuccessModal() {
    setShowSuccessModal(false)
    document.body.style.overflow = ''
  }

  async function downloadTicket() {
    if (!ticketRef.current) return
    
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#1a1f4e',
        scale: 2
      })
      
      const link = document.createElement('a')
      link.download = `movie-ticket-${selectedMovie?.title?.replace(/\s+/g, '-') || 'booking'}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error downloading ticket:', error)
      alert('Failed to download ticket. Please try again.')
    }
  }

  async function shareTicket() {
    const shareData = {
      title: 'Movie Ticket - BookMyMovie',
      text: `I've booked tickets for "${selectedMovie?.title}"! 🎬\n📅 Date: ${new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}\n⏰ Time: ${showTime}\n🎫 Seats: ${selectedSeats.join(', ')}\n💰 Tickets: ${numTickets}`,
    }

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
        }
      }
    }

    try {
      await navigator.clipboard.writeText(shareData.text)
      alert('Ticket details copied to clipboard!')
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      alert(shareData.text)
    }
  }

  function openLoginModal() {
    setShowLoginModal(true)
    setShowRegisterModal(false)
  }

  function openRegisterModal() {
    setShowRegisterModal(true)
    setShowLoginModal(false)
  }

  function closeAuthModals() {
    setShowLoginModal(false)
    setShowRegisterModal(false)
  }

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <>
      <button id="theme-toggle" className="theme-toggle" title="Toggle Theme" onClick={toggleTheme}>
        <i className={theme === 'light' ? 'fas fa-sun' : 'fas fa-moon'}></i>
      </button>

      <header>
        <div className="header-content">
          <h1><i className="fas fa-film"></i> BookMyMovie</h1>
          <nav>
            {user ? (
              <>
                <span className="user-greeting">Hello, {user.name}!</span>
                <button id="favorites-btn" className="nav-btn" onClick={showFavorites}>
                  <i className="fas fa-heart"></i> Favorites
                </button>
                <button className="nav-btn logout-btn" onClick={logout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </>
            ) : (
              <>
                <button className="nav-btn auth-btn" onClick={openLoginModal}>
                  <i className="fas fa-sign-in-alt"></i> Login
                </button>
                <button className="nav-btn auth-btn register-btn" onClick={openRegisterModal}>
                  <i className="fas fa-user-plus"></i> Register
                </button>
              </>
            )}
          </nav>
        </div>
        <form id="form" onSubmit={handleSearch}>
          <input
            ref={searchRef}
            type="text"
            id="search"
            className="search"
            placeholder="Search movies..."
          />
        </form>
        <div className="movie-type-filter">
          <button 
            className={`type-btn ${movieType === 'all' ? 'active' : ''}`}
            onClick={() => handleMovieTypeChange('all')}
          >
            All Movies
          </button>
          <button 
            className={`type-btn ${movieType === 'hollywood' ? 'active' : ''}`}
            onClick={() => handleMovieTypeChange('hollywood')}
          >
            Hollywood
          </button>
          <button 
            className={`type-btn ${movieType === 'bollywood' ? 'active' : ''}`}
            onClick={() => handleMovieTypeChange('bollywood')}
          >
            Bollywood
          </button>
          <button 
            className={`type-btn ${movieType === 'tamil' ? 'active' : ''}`}
            onClick={() => handleMovieTypeChange('tamil')}
          >
            Tamil
          </button>
          <button 
            className={`type-btn ${movieType === 'telugu' ? 'active' : ''}`}
            onClick={() => handleMovieTypeChange('telugu')}
          >
            Telugu
          </button>
          <button 
            className={`type-btn ${movieType === 'toprated' ? 'active' : ''}`}
            onClick={() => handleMovieTypeChange('toprated')}
          >
            Top Rated
          </button>
          <button 
            className={`type-btn ${movieType === 'upcoming' ? 'active' : ''}`}
            onClick={() => handleMovieTypeChange('upcoming')}
          >
            Upcoming
          </button>
        </div>
      </header>

      {/* Streaming Section */}
      {showStreaming && (
        <section id="streaming-section" className="streaming-section">
          <div className="streaming-header">
            <h2><i className="fas fa-play-circle"></i> Watch Online</h2>
            <button id="close-streaming" className="close-streaming" onClick={closeStreaming}>&times;</button>
          </div>
          <div id="streaming-providers" className="streaming-providers">
            <div className="provider-filter">
              <button className={`provider-btn ${selectedProvider === 'all' ? 'active' : ''}`} data-provider="all" onClick={() => filterStreamingMovies('all')}>All</button>
              <button className={`provider-btn ${selectedProvider === 'netflix' ? 'active' : ''}`} data-provider="netflix" onClick={() => filterStreamingMovies('netflix')}><i className="fab fa-netflix"></i> Netflix</button>
              <button className={`provider-btn ${selectedProvider === 'prime' ? 'active' : ''}`} data-provider="prime" onClick={() => filterStreamingMovies('prime')}><i className="fab fa-amazon"></i> Prime</button>
              <button className={`provider-btn ${selectedProvider === 'disney' ? 'active' : ''}`} data-provider="disney" onClick={() => filterStreamingMovies('disney')}><i className="fab fa-disney"></i> Disney+</button>
              <button className={`provider-btn ${selectedProvider === 'hulu' ? 'active' : ''}`} data-provider="hulu" onClick={() => filterStreamingMovies('hulu')}><i className="fab fa-hulu"></i> Hulu</button>
              <button className={`provider-btn ${selectedProvider === 'hbomax' ? 'active' : ''}`} data-provider="hbomax" onClick={() => filterStreamingMovies('hbomax')}><i className="fab fa-hbo"></i> HBO</button>
            </div>
            <div id="streaming-movies" className="streaming-movies">
              {getFilteredStreamingMovies().map(movie => (
                <div key={movie.id} className="streaming-movie" onClick={() => showStreamingOptions(movie)}>
                  <img src={movie.poster_path ? IMG_PATH + movie.poster_path : 'https://via.placeholder.com/200x280?text=No+Image'} alt={movie.title} />
                  <div className="streaming-movie-info">
                    <h3>{movie.title}</h3>
                    <div className="providers-list">
                      {movie.providers && [...(movie.providers.flatrate || []), ...(movie.providers.rent || []), ...(movie.providers.buy || [])].slice(0, 4).map((p, i) => (
                        <div key={i} className={`provider-logo ${getProviderClass(p.provider_id)}`}>{p.provider_name.substring(0, 2).toUpperCase()}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {showLoading && (
        <div id="loader" className="loader">
          <div className="spinner"></div>
        </div>
      )}

      {error && (
        <div id="error-msg" className="error-msg">
          {error}
        </div>
      )}

      {!showStreaming && (
        <main id="main" ref={mainRef}>
          {movies.map((movie) => (
            <div key={movie.id} className="movie" onClick={() => showMovieDetails(movie)}>
              <button 
                className={`favorite-btn ${isFavorite(movie.id) ? 'fas' : 'far'}`} 
                title="Add to favorites"
                onClick={(e) => { e.stopPropagation(); toggleFavorite(movie); }}
              >
                <i className={isFavorite(movie.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
              </button>
              <img src={movie.poster_path ? IMG_PATH + movie.poster_path : 'https://via.placeholder.com/280x380?text=No+Image'} alt={movie.title} />
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <span className={getClassByRate(movie.vote_average)}>
                  {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                </span>
              </div>
              <div className="overview">
                <h3>Overview</h3>
                {movie.overview || 'No overview available.'}
              </div>
            </div>
          ))}
        </main>
      )}

      {showPagination && !showStreaming && (
        <div id="pagination" className="pagination">
          <button id="prev-btn" className="page-btn" onClick={handlePrevPage} disabled={currentPage === 1}>
            <i className="fas fa-chevron-left"></i> Prev
          </button>
          <span id="page-info">Page {currentPage}</span>
          <button id="next-btn" className="page-btn" onClick={handleNextPage}>
            Next <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {showModal && selectedMovie && (
        <div id="modal" className="modal" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal-content">
            <span className="close-modal" onClick={closeModal}>&times;</span>
            <div id="modal-body">
              <div className="modal-header">
                <img src={selectedMovie.poster_path ? IMG_PATH + selectedMovie.poster_path : 'https://via.placeholder.com/800x400?text=No+Image'} alt={selectedMovie.title} />
                <div className="modal-gradient"></div>
              </div>
              <div className="modal-details">
                <h2>{selectedMovie.title}</h2>
                <div className="modal-meta">
                  <span><i className="fas fa-calendar"></i> {selectedMovie.release_date ? selectedMovie.release_date.split('-')[0] : 'N/A'}</span>
                  <span><i className="fas fa-star"></i> {selectedMovie.vote_average ? selectedMovie.vote_average.toFixed(1) : 'N/A'}/10</span>
                </div>
                <div className="modal-rating">
                  <i className="fas fa-thumbs-up"></i> {getRatingText(selectedMovie.vote_average)}
                </div>
                <p className="modal-overview">{selectedMovie.overview || 'No overview available for this movie.'}</p>
                <div className="modal-actions">
                  <button 
                    className={`btn-favorite ${isFavorite(selectedMovie.id) ? 'favorited' : ''}`}
                    onClick={() => toggleFavorite(selectedMovie)}
                  >
                    <i className={isFavorite(selectedMovie.id) ? 'fas fa-heart' : 'far fa-heart'}></i>
                    {isFavorite(selectedMovie.id) ? 'Added to Favorites' : 'Add to Favorites'}
                  </button>
                  <button className="btn-trailer" onClick={() => showTrailer(selectedMovie)}>
                    <i className="fas fa-play"></i> Watch Trailer
                  </button>
                  <button className="btn-book" onClick={() => openBookingModal(selectedMovie)}>
                    <i className="fas fa-ticket-alt"></i> Book Tickets
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTrailerModal && (
        <div id="trailer-modal" className="modal" onClick={(e) => e.target === e.currentTarget && closeTrailerModal()}>
          <div className="modal-content trailer-content">
            <span className="close-modal" onClick={closeTrailerModal}>&times;</span>
            {streamingOptions.length > 0 ? (
              <>
                <h2><i className="fas fa-play"></i> Watch Online</h2>
                <div id="trailer-container" className="streaming-options">
                  <div className="streaming-providers-list">
                    {streamingOptions.map((p, i) => {
                      const isFlatrate = (selectedMovie?.providers?.flatrate || []).some(fp => fp.provider_id === p.provider_id)
                      const typeLabel = isFlatrate ? 'Stream' : ((selectedMovie?.providers?.rent || []).some(r => r.provider_id === p.provider_id) ? 'Rent' : 'Buy')
                      return (
                        <a 
                          key={i} 
                          href={getProviderLink(p.provider_id, selectedMovie?.title || '')} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="streaming-provider"
                          style={{ textDecoration: 'none' }}
                        >
                          <div className={`provider-icon ${getProviderClass(p.provider_id)}`}>{p.provider_name.substring(0, 2).toUpperCase()}</div>
                          <div className="streaming-provider-info">
                            <h4>{p.provider_name}</h4>
                            <p>{typeLabel}</p>
                          </div>
                          <button type="button" className="watch-btn">Watch</button>
                        </a>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2><i className="fas fa-play"></i> Watch Trailer</h2>
                <div id="trailer-container">
                  {showLoading ? (
                    <div className="trailer-loader">
                      <div className="spinner"></div>
                      <p>Loading...</p>
                    </div>
                  ) : trailerKey ? (
                    <div className="trailer-wrapper">
                      <iframe 
                        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title="trailer"
                      ></iframe>
                    </div>
                  ) : (
                    <div className="trailer-error">
                      <i className="fas fa-video-slash"></i>
                      <h3>No Trailer Available</h3>
                      <p>Sorry, no trailer is available for this movie.</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showBookingModal && selectedMovie && (
        <div id="booking-modal" className="modal" onClick={(e) => e.target === e.currentTarget && closeBookingModal()}>
          <div className="modal-content booking-content">
            <span className="close-modal" onClick={closeBookingModal}>&times;</span>
            <div id="booking-body">
              <div className="booking-container">
                <div className="booking-left">
                  <div className="booking-movie-card">
                    <img src={selectedMovie.poster_path ? IMG_PATH + selectedMovie.poster_path : 'https://via.placeholder.com/100x150?text=No+Image'} alt={selectedMovie.title} />
                    <div className="booking-movie-details">
                      <h3>{selectedMovie.title}</h3>
                      <p className="movie-format"><i className="fas fa-film"></i> 2D</p>
                      <p className="movie-language">English, Hindi</p>
                    </div>
                  </div>
                  
                  <div className="show-time-section">
                    <h4><i className="fas fa-calendar-alt"></i> Select Date</h4>
                    <div className="date-chips">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                        <button 
                          key={day} 
                          className={`date-chip ${selectedDate === idx ? 'active' : ''}`}
                          onClick={() => setSelectedDate(idx)}
                        >
                          <span className="day">{day}</span>
                          <span className="date">{new Date().getDate() + idx}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="show-time-section">
                    <h4><i className="fas fa-clock"></i> Select Show Time</h4>
                    <div className="time-slots">
                      <button className={`time-slot ${showTime === '10:00' ? 'active' : ''}`} onClick={() => setShowTime('10:00')}><span className="time">10:00</span><span className="format">AM</span></button>
                      <button className={`time-slot ${showTime === '13:00' ? 'active' : ''}`} onClick={() => setShowTime('13:00')}><span className="time">13:00</span><span className="format">PM</span></button>
                      <button className={`time-slot ${showTime === '16:00' ? 'active' : ''}`} onClick={() => setShowTime('16:00')}><span className="time">16:00</span><span className="format">PM</span></button>
                      <button className={`time-slot ${showTime === '19:00' ? 'active' : ''}`} onClick={() => setShowTime('19:00')}><span className="time">19:00</span><span className="format">PM</span></button>
                      <button className={`time-slot ${showTime === '22:00' ? 'active' : ''}`} onClick={() => setShowTime('22:00')}><span className="time">22:00</span><span className="format">PM</span></button>
                    </div>
                  </div>
                  
                  <div className="ticket-count-section">
                    <h4><i className="fas fa-ticket-alt"></i> Tickets</h4>
                    <div className="ticket-selector">
                      <button type="button" onClick={() => handleTicketsChange(-1)}><i className="fas fa-minus"></i></button>
                      <span className="ticket-count">{numTickets}</span>
                      <button type="button" onClick={() => handleTicketsChange(1)}><i className="fas fa-plus"></i></button>
                    </div>
                  </div>
                </div>
                
                <div className="booking-right">
                  <div className="screen-glow"><div className="screen-label">SCREEN</div><div className="screen-bar"></div></div>
                  
                  <div className="seat-legend">
                    <div className="legend-item"><div className="seat-sample available"></div><span>Available</span></div>
                    <div className="legend-item"><div className="seat-sample selected"></div><span>Selected</span></div>
                    <div className="legend-item"><div className="seat-sample occupied"></div><span>Occupied</span></div>
                    <div className="legend-item"><div className="seat-sample vip"></div><span>VIP ₹{TICKET_PRICE + 200}</span></div>
                    <div className="legend-item"><div className="seat-sample premium"></div><span>Premium ₹{TICKET_PRICE + 100}</span></div>
                  </div>
                  
                  <div className="seat-selection-area">
                    <div className="seat-row-label"><span>A</span><span>B</span><span>C</span><span>D</span><span>E</span><span>F</span></div>
                    <div className="seat-grid-container">
                      {[...Array(6)].map((_, row) => {
                        const rowLabel = String.fromCharCode(65 + row)
                        const seatClass = row < 2 ? 'vip' : row < 4 ? 'premium' : 'standard'
                        return (
                          <div key={row} className="seat-row" style={{ gap: '35px' }}>
                            {[...Array(8)].map((_, seat) => {
                              const seatNumber = `${rowLabel}${seat + 1}`
                              const isOccupied = occupiedSeats.includes(seatNumber)
                              const isSelected = selectedSeats.includes(seatNumber)
                              return (
                                <div key={seatNumber} className={`seat ${seatClass} ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`} onClick={() => !isOccupied && toggleSeat(seatNumber)}>
                                  <span className="seat-tooltip">{seatNumber}</span>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="booking-summary-bar">
                <div className="summary-info">
                  <div className="summary-item"><span className="label">Selected Seats</span><span className="value">{selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</span></div>
                  <div className="summary-item"><span className="label">Show Time</span><span className="value">{showTime || 'Not selected'}</span></div>
                  <div className="summary-item price"><span className="label">Total</span><span className="value">₹{(numTickets * TICKET_PRICE).toFixed(2)}</span></div>
                </div>
                <button type="button" className="book-ticket-btn" disabled={selectedSeats.length === 0 || !showTime} onClick={handleBookingSubmit}>
                  <i className="fas fa-ticket-alt"></i> Book Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFavoritesModal && (
        <div id="favorites-modal" className="modal" onClick={(e) => e.target === e.currentTarget && closeFavoritesModal()}>
          <div className="modal-content">
            <span className="close-modal" onClick={closeFavoritesModal}>&times;</span>
            <h2><i className="fas fa-heart"></i> Your Favorites</h2>
            <div id="favorites-list">
              {favorites.length === 0 ? (
                <div className="empty-favorites">
                  <i className="far fa-heart"></i>
                  <h3>No favorites yet!</h3>
                  <p>Start adding movies to your favorites list.</p>
                </div>
              ) : (
                favorites.map((movie) => (
                  <div key={movie.id} className="movie" onClick={() => { closeFavoritesModal(); showMovieDetails(movie); }}>
                    <button 
                      className="favorite-btn fas" 
                      title="Remove from favorites"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(movie); }}
                    >
                      <i className="fas fa-heart"></i>
                    </button>
                    <img src={movie.poster_path ? IMG_PATH + movie.poster_path : 'https://via.placeholder.com/280x380?text=No+Image'} alt={movie.title} />
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <span className={getClassByRate(movie.vote_average)}>
                        {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <div className="overview">
                      <h3>Overview</h3>
                      {movie.overview || 'No overview available.'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div id="success-modal" className="modal" onClick={(e) => e.target === e.currentTarget && closeSuccessModal()}>
          <div className="modal-content success-content">
            <div className="success-header">
              <div className="ticket-icon">
                <i className="fas fa-check"></i>
              </div>
              <h2>Booking Confirmed!</h2>
              <p>Your tickets have been booked successfully</p>
            </div>
            <div className="success-body" ref={ticketRef}>
              <div className="movie-ticket">
                <div className="ticket-movie-info">
                  <img 
                    src={selectedMovie?.poster_path ? IMG_PATH + selectedMovie.poster_path : 'https://via.placeholder.com/60x80?text=No+Image'} 
                    alt={selectedMovie?.title} 
                    className="ticket-poster"
                  />
                  <div className="ticket-details">
                    <h3>{selectedMovie?.title}</h3>
                    <p className="ticket-meta">2D • English, Hindi</p>
                  </div>
                </div>
                <div className="ticket-info-grid">
                  <div className="ticket-info-item">
                    <label>Date</label>
                    <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                  <div className="ticket-info-item time">
                    <label>Time</label>
                    <span>{showTime}</span>
                  </div>
                  <div className="ticket-info-item">
                    <label>Tickets</label>
                    <span>{numTickets}</span>
                  </div>
                  <div className="ticket-info-item seats">
                    <label>Seats</label>
                    <span>{selectedSeats.join(', ')}</span>
                  </div>
                </div>
              </div>
              <div className="booking-id">
                <label>Booking ID</label>
                <span>BKM{Date.now().toString().slice(-8)}</span>
              </div>
            </div>
            <div className="success-actions">
              <button className="btn-download" onClick={downloadTicket}>
                <i className="fas fa-download"></i> Download Ticket
              </button>
              <button className="btn-share" onClick={shareTicket}>
                <i className="fas fa-share-alt"></i> Share
              </button>
            </div>
            <div className="success-footer">
              <p>Thank you for booking with BookMyMovie!</p>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modals - Rendered last to appear on top */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={closeAuthModals} 
        onSwitchToRegister={openRegisterModal} 
      />
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={closeAuthModals} 
        onSwitchToLogin={openLoginModal} 
      />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App

