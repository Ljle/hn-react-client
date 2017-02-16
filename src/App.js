import React, {Component} from 'react'
import {Icon} from 'react-fa'
import {sortBy} from 'lodash'
import classNames from 'classnames'
import './App.css'

const largeColumn = {width: '40%'}
const midColumn = {width: '30%'}
const smallColumn = {width: '10%'}

const DEFAULT_QUERY = 'react'
const DEFAULT_PAGE = 0
const DEFAULT_HPP = '8'

const PATH_BASE = 'https://hn.algolia.com/api/v1'
const PATH_SEARCH = '/search'
const PARAM_SEARCH = 'query='
const PARAM_PAGE = 'page='
const PARAM_HPP = 'hitsPerPage='

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse()
}

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      isLoading: false
    }

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this)
    this.setSearchTopStories = this.setSearchTopStories.bind(this)
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this)
    this.onSearchChange = this.onSearchChange.bind(this)
    this.onSearchSubmit = this.onSearchSubmit.bind(this)
    this.onSearchChange = this.onSearchChange.bind(this)
    this.onDismiss = this.onDismiss.bind(this)
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm]
  }

  setSearchTopStories(result) {
    const {hits, page} = result
    const {searchKey, results} = this.state
    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : []
    const updatedHits = [...oldHits, ...hits]
    this.setState({
      results: {...results, [searchKey]: {hits: updatedHits, page}},
      isLoading: false
    })
  }

  fetchSearchTopStories(searchTerm, page) {
    this.setState({isLoading: true})
    fetch(
      `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`
    )
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
  }

  componentDidMount() {
    const {searchTerm} = this.state
    this.setState({searchKey: searchTerm})
    this.fetchSearchTopStories(searchTerm, DEFAULT_PAGE)
  }

  onDismiss(id) {
    const {searchKey, results} = this.state
    const {hits, page} = results[searchKey]
    const updatedHits = hits.filter(c => c.objectID !== id)
    this.setState({
      results: {...results, [searchKey]: {hits: updatedHits, page}}
    })
  }

  onSearchChange(event) {
    this.setState({searchTerm: event.target.value})
  }

  onSearchSubmit(event) {
    const {searchTerm} = this.state
    this.setState({searchKey: searchTerm})
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm, DEFAULT_PAGE)
    }
    event.preventDefault()
  }

  render() {
    const {isLoading, searchTerm, results, searchKey} = this.state
    const page = (results && results[searchKey] && results[searchKey].page) || 0
    const list = (results && results[searchKey] && results[searchKey].hits) || []
    return (
      <div className="page">
        <div className="interactions">
          <Search
            value={searchTerm}
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
            Search
          </Search>
        </div>
        <Table list={list} onDismiss={this.onDismiss} />
        <div className="interactions">
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
          >
            More
          </ButtonWithLoading>
        </div>
      </div>
    )
  }
}

const Search = ({children, onChange, value, onSubmit}) => (
  <form onSubmit={onSubmit}>
    <input type="text" onChange={onChange} value={value} />
    <button type="submit">{children}</button>
  </form>
)

class Table extends Component {
  constructor(props) {
    super(props)
    this.state = {sortKey: 'NONE', isSortReverse: false}
    this.onSort = this.onSort.bind(this)
  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey &&
      !this.state.isSortReverse
    this.setState({sortKey, isSortReverse})
  }

  render() {
    const {list, onDismiss} = this.props
    const {sortKey, isSortReverse} = this.state
    const sortedList = SORTS[sortKey](list)
    const reverseSortedList = isSortReverse ? sortedList.reverse() : sortedList
    return (
      <div className="table">
        <div className="table-header">
          <span style={largeColumn}>
            <Sort
              sortKey={'TITLE'}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              Title
            </Sort>
            <SortIcon
              sortKey={'TITLE'}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
            />
          </span>
          <span style={midColumn}>
            <Sort
              sortKey={'AUTHOR'}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              Author
            </Sort>
            <SortIcon
              sortKey={'AUTHOR'}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
            />
          </span><span style={smallColumn}>
            <Sort
              sortKey={'COMMENTS'}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              Comments
            </Sort>
            <SortIcon
              sortKey={'COMMENTS'}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
            />
          </span>
          <span style={smallColumn}>
            <Sort
              sortKey={'POINTS'}
              onSort={this.onSort}
              activeSortKey={sortKey}
            >
              Points
            </Sort>
            <SortIcon
              sortKey={'POINTS'}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
            />
          </span>
          <span style={smallColumn}>Hide</span>
        </div>
        {reverseSortedList.map(item => (
          <div key={item.objectID} className="table-row">
            <span style={largeColumn}>
              <a href={item.url}>{item.title}</a>
            </span>
            <span style={midColumn}>
              {item.author}
            </span>
            <span style={smallColumn}>
              {item.num_comments}
            </span>
            <span style={smallColumn}>
              {item.points}
            </span>
            <span style={smallColumn}>
              <Button
                onClick={() => onDismiss(item.objectID)}
                className="button-inline"
              >
                Dismiss
              </Button>
            </span>
          </div>
        ))}
      </div>
    )
  }
}

const Button = ({onClick, className = '', children}) => (
  <button onClick={onClick} className={className} type="button">
    {children}
  </button>
)

const Loading = () => <Icon spin size="3x" name="spinner" />

const SortIcon = ({sortKey, isSortReverse, activeSortKey}) => {
  const sortName = classNames({
    'caret-up': !isSortReverse && sortKey === activeSortKey,
    'caret-down': isSortReverse && sortKey === activeSortKey
  })
  return <Icon size="lg" name={sortName} />
}

const withLoading = (Component) =>
  ({isLoading, ...rest}) => isLoading ? <Loading /> : <Component {...rest} />

const ButtonWithLoading = withLoading(Button)

const Sort = ({sortKey, onSort, children, activeSortKey}) => {
  const sortClass = classNames('button-inline', {
    'button-active': sortKey === activeSortKey
  })
  return (
    <Button className={sortClass} onClick={() => onSort(sortKey)}>
      {children}
    </Button>
  )
}

export default App
export {Button, Table, Search}

