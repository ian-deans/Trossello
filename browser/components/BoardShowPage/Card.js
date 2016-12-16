import React, { Component } from 'react'
import Form from '../Form'
import Link from '../Link'
import Icon from '../Icon'
import boardStore from '../../stores/boardStore'
import autosize from 'autosize'
import ArchiveButton from './ArchiveButton'
import ConfirmationLink from '../ConfirmationLink'
import EditCardForm from './EditCardForm'
import CardLabel from './Card/CardLabel'
import commands from '../../commands'
import Badge from './Card/Badge'
import moment from 'moment'
import CardMember from './Card/CardMember'

export default class Card extends Component {
  static contextTypes = {
    redirectTo: React.PropTypes.func.isRequired,
  };

  static propTypes = {
    card: React.PropTypes.object.isRequired,
    board: React.PropTypes.object,
    editable: React.PropTypes.bool,
    ghosted: React.PropTypes.bool,
    beingDragged: React.PropTypes.bool,
    style: React.PropTypes.object,
  };

  static defaultProps = {
    editable: false,
    ghosted: false,
    beingDragged: false,
  };

  constructor(props){
    super(props)
    this.state = {
      editingCard: false,
      cardTop: null,
      cardLeft: null,
      cardWidth: null,
    }
    this.editCard = this.editCard.bind(this)
    this.cancelEditingCard = this.cancelEditingCard.bind(this)
    this.openShowCardModal = this.openShowCardModal.bind(this)
  }

  editCard(event) {
    event.preventDefault()
    event.stopPropagation()
    const rect = this.refs.card.getBoundingClientRect()
    this.setState({
      editingCard: true,
      cardTop: rect.top,
      cardLeft: rect.left,
      cardWidth: rect.width,
    })
  }

  cancelEditingCard(event){
    this.setState({
      editingCard: false,
      cardTop: null,
      cardLeft: null,
      cardWidth: null,
    })
  }

  openShowCardModal(event){
    const { card } = this.props
    const target = event.target.attributes.class === undefined
      ? ''
      : event.target.attributes.class.value

    if (target.includes('Avatar') ||
      target.includes('CardModal-CardMemberPopover-removeLink') ||
      event.ctrlKey || event.metaKey || event.shiftKey) return
    event.preventDefault()
    this.context.redirectTo(`/boards/${card.board_id}/cards/${card.id}`)
  }

  render() {
    const {
      board,
      card,
      editable,
      ghosted,
      beingDragged,
      style
    } = this.props

    const dueDateBadge = card.due_date
      ? <Badge card={card} shownOn='front'/>
      : null

    let cardLabels = !board ? null : card.label_ids
      .map( labelId => board.labels.find(label => label.id === labelId))
      .map( label =>
        <div key={label.id} className="BoardShowPage-Card-label">
          <CardLabel color={label.color} text={''} checked={false} />
        </div>
      )

    const cardUsers = card.user_ids.length > 0
      ? card.user_ids
        .map( userId => board.users.find( user => user.id === userId ))
        .map( user =>
          <CardMember
            key={user.id}
            board={board}
            card={card}
            user={user}
          />
        )
      : null

    const editCardButton = this.props.editable ?
      <EditCardButton onClick={this.editCard} /> : null

    const editCardModal = this.state.editingCard ?
      <EditCardModal
        card={this.props.card}
        onCancel={this.cancelEditingCard}
        onSave={this.cancelEditingCard}
        top={this.state.cardTop}
        left={this.state.cardLeft}
        width={this.state.cardWidth}
      /> :
      null

    let className = 'BoardShowPage-Card'

    const archivedFooter= card.archived ?
     <div><Icon type="archive" /> Archived</div> :
      null
    if (ghosted) className += ' BoardShowPage-Card-ghosted'
    if (beingDragged) className += ' BoardShowPage-Card-beingDragged'

    return <div
      ref="card"
      className={className}
      style={style}
    >
      {editCardModal}
      <div className="BoardShowPage-Card-box"
        data-card-id={card.id}
        data-list-id={card.list_id}
        data-order={card.order}
        onClick={this.openShowCardModal}
        draggable
        onDragStart={this.props.onDragStart}
      >
        <div className="BoardShowPage-Card-labels">
          {cardLabels}
        </div>
        <pre>{card.content}</pre>
        <div className="BoardShowPage-Card-bottom">
          {dueDateBadge}
          <div className="BoardShowPage-Card-bottom-members">
            {cardUsers}
          </div>
        </div>
        {archivedFooter}
      </div>
      <div className="BoardShowPage-Card-controls">
        {editCardButton}
      </div>
    </div>
  }

}

const EditCardButton = (props) => {
  return <Link className="BoardShowPage-EditButton" onClick={props.onClick}>
    <Icon size='0' type="pencil" />
  </Link>
}

class EditCardModal extends Component {
  static propTypes = {
    card:    React.PropTypes.object.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onSave:  React.PropTypes.func.isRequired,
    top:     React.PropTypes.number.isRequired,
    left:    React.PropTypes.number.isRequired,
    width:   React.PropTypes.number.isRequired,
  }
  constructor(props){
    super(props)
    this.cancel = this.cancel.bind(this)
  }

  stopPropagation(event){
    event.preventDefault()
    event.stopPropagation()
  }

  cancel(){
    this.props.onCancel()
  }

  render(){
    const style = {
      top: this.props.top,
      left: this.props.left,
      width: this.props.width+'px',
    }
    return <div
        className="BoardShowPage-EditCardModal"
      >
      <div
        className="BoardShowPage-EditCardModal-shroud"
        onMouseDown={this.stopPropagation}
        onClick={this.cancel}
      />
      <div style={style} className="BoardShowPage-EditCardModal-window">
        <EditCardForm
          card={this.props.card}
          onCancel={this.cancel}
          submitButtonName="Save"
          onSave={this.props.onSave}
          hideCloseX
        />
      </div>
    </div>
  }
}
