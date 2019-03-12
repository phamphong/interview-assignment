import React, { Component } from 'react';
import {getDeck, shuffleDeck, drawDeck} from '../services/api'
import {default as Player} from './Player'
import './style.css';
import {Table, TableBody, TableCell, TableHead, TableRow, Paper, Grid, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from '@material-ui/core';

const betPoint = 5000
const initPoint = 25000
const totalRound = 5
const getValue = (val) => {
    return isNaN(val - 0) ? val === 'ACE' ? 1 : 0 : (val - 0)
}

class Board extends Component {

    state = {
        round: 0,
        players:[],
        status: false,
        bet: 0,
        loading: false,
    }

    componentDidMount() {
        this.startGame()
    }
    
    startGame() {
        let players = []
        for (let index = 0; index < 4; index++) {
            let id = index + 1
            players.push({
                name: `Player ${id}${index === 2 ? '(Me)' : ''}`,
                cards: [],
                id,
                point: initPoint
            })
        }
        this.setState({loading: true, players, lastWinner: undefined, round: 0})
        getDeck()
        .then(res => {
            let {deck_id, remaining, shuffled} = res
            this.setState({deck: {deck_id, remaining, shuffled}, loading: false})
        })
    }

    shuffle() {
        let {deck, players} = this.state
        this.setState({loading: true})
        if(!!deck && !!deck.deck_id) {
            shuffleDeck(deck.deck_id)
            .then(res => {
                let {deck_id, remaining, shuffled} = res
                players.map(k => {
                    k.cards = []
                    k.isWinner = false
                    return k
                })
                this.setState({players, status: false, deck: {deck_id, remaining, shuffled}, loading: false})
            })
        }
    }

    draw() {
        let {deck, players, bet} = this.state
        this.setState({loading: true})
        if(!!deck && !!deck.deck_id && !!players) {
            let array = []
            players.map(k => {
                array.push(drawDeck(deck.deck_id))
                return k
            })
            Promise.all(array)
            .then(res => {
                res.map((k,i) => {
                    let {remaining, cards} = res[i]
                    let player = players[i]
                    deck.remaining = remaining
                    player.cards = cards
                    let value = 0
                    cards.map(h => {
                        value += getValue(h.value)
                        return h
                    })
                    if(value > 0) {
                        player.value = value%10
                    } else {
                        player.value = 30
                    }
                    player.point -= betPoint
                    bet += betPoint
                    this.setState({deck, players, bet, loading: false})
                    return k
                })
            })
        }
    }

    reveal() {
        let {players, bet, round} = this.state
        this.setState({status: true})
        let hightest = Math.max.apply(Math, players.map((k) => {
            return k.value
        }))
        let winner = players.filter(k => k.value === hightest)
        let winPoint = bet/winner.length
        winner.map(k => {
            k.point += winPoint
            bet -= winPoint
            k.isWinner = true
            return k
        })
        this.setState({players, bet, round: round+1}, () => {
            let {players: players1, round: round1} = this.state
            if(round1 === totalRound) {
                let hightestPoint = Math.max.apply(Math, players1.map((k) => {
                    return k.point
                }))
                let lastWinner = players.filter(k => k.point === hightestPoint)
                this.setState({lastWinner})
            }
        })
    }

    render() {
        let {players, status, deck, bet, round, loading, lastWinner} = this.state
        return (
            <div className="Board">
                <Grid container>
                    <Grid item xs={12} md={6} className='item-padding'>
                        <Paper>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {players.map((k,i) =>
                                            <TableCell key={i}>{k.name}</TableCell>
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        {players.map((k,i) =>
                                            <TableCell key={i}>{k.point} pts</TableCell>
                                        )}
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Paper>
                    </Grid>
                    <Grid item container xs={12} md={6} direction='row' justify='center' alignItems='center' className='item-padding'>
                        <Grid item className='item-padding'>
                            <Button variant="contained" onClick={e => this.shuffle()} disabled={!!bet || round === totalRound || loading}>
                                Shuffle
                            </Button>
                        </Grid>
                        <Grid item className='item-padding'>
                            <Button variant="contained" color="primary" onClick={e => this.draw()} disabled={!!!deck || deck.remaining !== 52 || round === totalRound || loading}>
                                Draw
                            </Button>
                        </Grid>
                        <Grid item className='item-padding'>
                            <Button variant="contained" color="secondary" onClick={e => this.reveal()} disabled={bet === 0 || loading}>
                                Reveal
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
                <div className='game-area'>
                    {players.map((k,i) =>
                        <Player key={i} player={k} status={status} />
                    )}
                    <div className={`loading ${loading ? 'show' : 'hide'}`} />
                </div>
                {/* <Modal
                    open={!!round === totalRound && !!lastWinner}
                    onClose={this.handleClose}
                >
                    <div>
                        <Typography variant="h6" id="modal-title">
                            Game Ended.
                        </Typography>
                        <Typography variant="subtitle1" id="simple-modal-description">
                            Winner: 
                        </Typography>
                    </div>
                </Modal> */}
                <Dialog
                    open={round === totalRound && !!lastWinner}
                    // TransitionComponent={Transition}
                    keepMounted
                    onClose={this.handleClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle id="alert-dialog-slide-title">
                        {"Congratulation!"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            Winner: {!!lastWinner && lastWinner.map(k => k.name).toString()}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={e => this.startGame()} color="primary">
                            New Game
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

export default Board;