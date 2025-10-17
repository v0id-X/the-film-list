import React, {useEffect } from 'react'
import Search from './components/Search'
import { useState } from 'react'
import Loading from './components/Loading';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

function App() {

  const [searchTerm,setSearchTerm] = useState('')
  const [errorMsg,setErrorMsg]  = useState("")
  const [movieList,setMovieList] = useState([])
  const [trendingMovies,setTrendingMovies] = useState([])
  const [isLoading,setIsLoading] = useState(true)
  const [debouncedSearchTerm,setDebouncedSearchTerm] = useState('')
  

  useDebounce(()=> setDebouncedSearchTerm(searchTerm),500,[searchTerm])

  
  const fetchMovies = async (query = '')=>{
    setIsLoading(true)
    setErrorMsg("")
  try{
  
    const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`:
  `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;

    const response = await fetch(endpoint,API_OPTIONS)

    if(!response.ok){throw new Error('Failed to fetch movies')}

    const data = await response.json();
    
    if(data.response === 'False'){
      setErrorMsg(data.error || 'Failed to fetch movies')
      setMovieList([])
      return;
    }if(query && data.results.length > 0){
     await updateSearchCount(query, data.results[0]);
    }
    setMovieList(data.results||[]);
  }catch(e){
    //console.log(`Error fetching movies ${e}`);
    setErrorMsg("Error fetching movies. Please try again later.")
  }finally{
    setIsLoading(false)
  }
}

const fetchTrendingMovies = async () =>{
  try{
    const movies = await getTrendingMovies();
    setTrendingMovies(movies)
  }catch(err){
    console.log(`Error fetching trending movies: ${err}`);
  }
}

  useEffect(()=>{
    fetchMovies(debouncedSearchTerm);
  },[debouncedSearchTerm])

  useEffect(()=>{
    fetchTrendingMovies();
  })

  return (
    <>
    
    <main>

      <div className='pattern' >

        <div className='wrapper'>

          <header>
            <img src="hero.png"/>
            <h1>Find <span className='text-gradient'>Movies </span> Just The Way You Like It</h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
          </header>


        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Searches</h2>

          <ul>
            {trendingMovies.map((movie,index)=>(
              <li key={movie.$id}>
                <p>{index + 1}</p>
                <img src={movie.poster_url} alt={movie.title} />
              </li>
            ))}
          </ul>

          </section>
        )}


          <section className='all-movies'>
            <h2>Popular Movies</h2>

            {isLoading?(<Loading />):errorMsg?(
              <p className='text-red-400'>{errorMsg}</p>
            ):(
              <ul>
                {movieList.map((movie)=>(
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </ul>
            )
            }

            {errorMsg && <p className='text-red-400'>{errorMsg}</p>}
          </section>
          
        </div>
      
      </div>

    </main>
    
    </>
  )
}

export default App