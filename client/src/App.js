import React from "react";
import "./App.css";
import { Container, FormGroup, Form, Input, Label, Button } from "reactstrap";
import axios from "axios";
import socketIOClient from "socket.io-client";
// const serverURI = "https://enigmatic-sierra-05542.herokuapp.com/";
// const serverURI = "https://mern-chat-app-socketio.herokuapp.com";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      message: "",
      messages: [],
    };

    this.chatboxRef = React.createRef();

    this.handleSubmit = this.handleSubmit.bind(this);

    this.socket = socketIOClient();

    this.socket.on("message", () => this.getMessages());
    this.socket.on("hello", (message) => console.log(message));
  }

  componentDidMount() {
    this.getMessages();
    console.log("mounted");
    this.scrollToBottom();
  }

  componentDidUpdate() {
    this.scrollToBottom();
  }
  scrollToBottom = () => {
    // this.chatboxRef.current.scrollToEnd({ animated: false });
    this.chatboxRef.current.scrollIntoView({ behavior: "smooth" });
    // console.log("chat box ref", this.chatboxRef.current);
  };

  getMessages() {
    axios
      .get("/messages")
      .then((res) =>
        this.setState({
          messages: res.data.map((message) => (
            <div
              className={
                message.name === this.state.name
                  ? "message-container-own"
                  : "message-container-other"
              }
            >
              <div
                className={
                  message.name === this.state.name
                    ? "speach-bubble-own"
                    : "speach-bubble-other"
                }
              >
                <p>{message.message}</p>
              </div>
              <div
                className={
                  message.name === this.state.name ? "name-own" : "name-other"
                }
              >
                {message.name}
              </div>
            </div>
          )),
        })
      )
      .catch((err) => console.log(err));
  }

  handleSubmit(e) {
    if (e.key === "Enter" || !e.key) {
      e.preventDefault();
      axios.post("/messages", this.state);
      this.setState({ message: "" });
    }
  }

  handleDelete() {
    axios.delete("/messages").catch((err) => console.log(err));
  }

  render() {
    return (
      <div className="App">
        <Container className="themed-container border shadow p-3 rounded ">
          <Button
            color="danger"
            className="delete-button"
            onClick={this.handleDelete}
          >
            Delete All Messages
          </Button>
          <div className="messages">
            {this.state.messages}
            {/* dummy ref below for scrolling to bottom */}
            <div ref={this.chatboxRef} className="message-container-other" />
          </div>
          <Form onSubmit={this.handleSubmit}>
            <FormGroup>
              <Label for="name">Name</Label>
              <Input
                type="text"
                placeholder="Insert screen name here."
                value={this.state.name}
                onChange={(e) => this.setState({ name: e.target.value })}
              ></Input>
            </FormGroup>
            <FormGroup>
              <Label for="input message">Message</Label>
              <Input
                type="textarea"
                placeholder="Write your message here."
                value={this.state.message}
                onChange={(e) => this.setState({ message: e.target.value })}
                onKeyDown={this.handleSubmit}
              ></Input>
            </FormGroup>
            <Button type="submit">Send Message</Button>
          </Form>
        </Container>
      </div>
    );
  }
}

export default App;
