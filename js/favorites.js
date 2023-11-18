import { GithubUser } from "./githubUser.js"

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {

      const userExists = this.entries.find(entry => entry.login === username)

      if(userExists) {
        throw new Error('Usuário já cadastrado!')
      }

      const user = await GithubUser.search(username)

      if(user.login === undefined) {
        throw new Error('User not found!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

    this.entries = filteredEntries
    this.update()
    this.save()
  }

  
  checkIfEmpty() {
    const noFavs = this.root.querySelector('.noFavoritesYet')
    const users = this.entries.length

    if(users > 0) {
      noFavs.classList.add('hide')
    } else {
      noFavs.classList.remove('hide')
    }
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button')

    window.document.onkeyup = event => {
      if(event.key === "Enter") {
        const { value } = this.root.querySelector('.search input')

      this.add(value)
      this.cleanInput()
      }
    }
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
      this.cleanInput()
    }
  }

  cleanInput() {
      if(this.onadd) {
        document.querySelector('.search input').value = ""
    }
  }
  
  update() {
    this.checkIfEmpty()
    this.removeAllTr()    
    
    this.entries.forEach( user => {
      const row = this.createRow()
      
      row.querySelector('.user img').src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('.user a').href = `https://github.com/${user.login}`
      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers
      
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm(`Are you sure you want to delete ${user.login}?`)
        if(isOk) {
          this.delete(user)
        }
      }
      
      this.tbody.append(row)
    })
  }
  
  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = 
    `
    <td class="user">
      <img src="https://github.com/maykbrito.png" alt="Imagem maykbrito">
      <a href="https://github.com/maykbrito">
        <p>Mayk Brito</p>
        <span>maykbrito</span>
      </a>
    </td>
    <td class="repositories">78</td>
    <td class="followers">2736</td>
    <td class="remove">Remove</td>
    `
    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr')
    .forEach((tr) => {
      tr.remove()
    })
  }

}
