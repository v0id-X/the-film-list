import React from 'react'

function Search({searchTerm,setSearchTerm}) {
  return (
    <div className='search'>
        <img src="search.png" />

        <input 
        type="text"
        placeholder='Search Through Thousands Of Movies....'
        value={searchTerm}
        onChange={(e)=>{
            setSearchTerm(e.target.value)
        }}
        />
    </div>
  )
}

export default Search