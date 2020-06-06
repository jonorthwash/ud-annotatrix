## Classes

<dl>
<dt><a href="#App">App</a></dt>
<dd><p>Wrapper class to hold references to all of our actual client objects (e.g.
 CollaborationInterface, Corpus, GUI, Graph, Server, Socket, UndoManager).
 This class should be instantiated at the beginning of a session.</p>
</dd>
<dt><a href="#Corpus">Corpus</a></dt>
<dd><p>Abstraction over the nx.Corpus to handle some extra metadata (filename, text
 direction, filename) and interfacing with our other modules.</p>
</dd>
<dt><a href="#Server">Server</a></dt>
<dd><p>Abstraction over an AJAX connection.  Handles sending and receiving large
 packets from a server.  Usually, this means the initial loading of the
    corpus, as well as saving (including (de)serialization).</p>
</dd>
<dt><a href="#Socket">Socket</a></dt>
<dd><p>Abstraction over a SocketIO connection.  Handles sending and receiving small
 packets from a server.</p>
<p>NB: this handles all server communication except for the (de)serialization of
 the corpus (this is handled via AJAX calls).</p>
</dd>
<dt><a href="#CollaborationInterface">CollaborationInterface</a></dt>
<dd><p>Abstraction to help with handling multiple users collaborating on a document.
 This module takes care of maintaining:</p>
<ul>
<li>the current user</li>
<li>a list of all current users on this document</li>
<li>methods for getting the mice and locks for those users</li>
</ul>
</dd>
<dt><a href="#User">User</a></dt>
<dd><p>Data structure to keep track of state and methods associated with a particular
 socket connection.</p>
<p>NB: the data parameter should contain</p>
<ul>
<li>username (optional): the GitHub account associated with this connection</li>
<li>id: user identifier, shared with the server</li>
<li>address: IP Address of the connection</li>
<li>index: the corpus index on this user&#39;s page</li>
<li>mouse: the x, y coordinates of the user&#39;s mouse (within #cy)</li>
<li>locked: a cytoscape selector to locate the node currently being edited</li>
</ul>
</dd>
<dt><a href="#Graph">Graph</a></dt>
<dd><p>Abstraction over the graph editor.  Handles interaction between the graph
 and the user.  For example, all the event handlers are here, the methods that
 draw the graph, and the methods that place the mice / locks.</p>
</dd>
<dt><a href="#Chat">Chat</a></dt>
<dd><p>Abstraction to deal with interaction with #chat element and its descendents.
 Handles outgoing and incoming messages and alerts, event callbacks, and
 updating user spans.</p>
</dd>
<dt><a href="#GUI">GUI</a></dt>
<dd><p>Abstraction over the user interface.  Handles interaction between user via
 DOM elements &amp; keystrokes and the application instance.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#detectFormat">detectFormat(serial)</a> ⇒ <code>String</code> | <code>null</code></dt>
<dd><p>Helper function for Corpus.  Attempts to detect the format of a given serial
 string/object.  If it can&#39;t detect one, it returns null.  If it detects one
 or more, it follows a simple resolution algorithm to pick one.</p>
</dd>
<dt><a href="#vertical">vertical(n1, n2)</a></dt>
<dd><p>Function to sort nodes with vertical orientation.</p>
</dd>
<dt><a href="#ltr">ltr(n1, n2)</a></dt>
<dd><p>Function to sort nodes with left-to-right orientation.</p>
</dd>
<dt><a href="#rtl">rtl(n1, n2)</a></dt>
<dd><p>Function to sort nodes with right-to-left orientation.</p>
</dd>
<dt><a href="#bind">bind(eles)</a></dt>
<dd><p>Bind the elements to the internal reference.</p>
</dd>
<dt><a href="#run">run()</a></dt>
<dd><p>Main function that runs all of the
subfunctions needed to generate the graph.</p>
</dd>
<dt><a href="#drawNodes">drawNodes()</a></dt>
<dd><p>Draws the nodes on the svg.</p>
</dd>
<dt><a href="#drawDeprels">drawDeprels()</a></dt>
<dd><p>Draws deprels.</p>
</dd>
<dt><a href="#tokenDist">tokenDist(id)</a></dt>
<dd><p>Returns the token distance for a deprel.</p>
</dd>
<dt><a href="#curve">curve(initialOffset, ypos1, xpos2, dir, rectWidth, h, height)</a></dt>
<dd><p>Generates curve for deprel.
The curve starts at initialOffset (M) and consists of a
straight line (L) that goes into a cubic curve (C) which
then goes into a straight line (L) to rectLeft. Then we
leave a gap for the label and start the other half at
rectRight (M) and the same idea follows again.
Here, • denotes a control point used.
        •   •   • label •   •   •</p>
<pre><code>  •                           •

•                                •</code></pre></dd>
<dt><a href="#getHeights">getHeights(deprels)</a></dt>
<dd><p>Calculates the heights for each deprel.</p>
</dd>
<dt><a href="#latex">latex(app)</a> ⇒ <code>String</code></dt>
<dd><p>Export an application instance to LaTeX format.  The client will be prompted
 to download the file.</p>
</dd>
<dt><a href="#png">png(app)</a></dt>
<dd><p>Export an application instance to PNG format.  The client will be prompted to
 download the file.</p>
</dd>
<dt><a href="#svg">svg(app)</a></dt>
<dd><p>Export an application instance to SVG format.  The client will be prompted to
 download the file.</p>
</dd>
</dl>

<a name="App"></a>

## App
Wrapper class to hold references to all of our actual client objects (e.g.
 CollaborationInterface, Corpus, GUI, Graph, Server, Socket, UndoManager).
 This class should be instantiated at the beginning of a session.

**Kind**: global class  

* [App](#App)
    * [.save()](#App+save)
    * [.load()](#App+load)
    * [.discard()](#App+discard)
    * [.download()](#App+download)

<a name="App+save"></a>

### app.save()
Save all current corpus- and meta-data, either to the server or to
 localStorage.

**Kind**: instance method of [<code>App</code>](#App)  
<a name="App+load"></a>

### app.load()
Load a corpus from a serial string.

**Kind**: instance method of [<code>App</code>](#App)  
<a name="App+discard"></a>

### app.discard()
Load a fresh/new corpus and overwrite an existing one.

**Kind**: instance method of [<code>App</code>](#App)  
<a name="App+download"></a>

### app.download()
Download the contents of an application instance.

**Kind**: instance method of [<code>App</code>](#App)  
<a name="Corpus"></a>

## Corpus
Abstraction over the nx.Corpus to handle some extra metadata (filename, text
 direction, filename) and interfacing with our other modules.

**Kind**: global class  

* [Corpus](#Corpus)
    * [new Corpus(app, serial)](#new_Corpus_new)
    * [.format](#Corpus+format) ⇒ <code>String</code> \| <code>null</code>
    * [.format](#Corpus+format)
    * [.is_ltr](#Corpus+is_ltr) ⇒ <code>Boolean</code>
    * [.is_ltr](#Corpus+is_ltr)
    * [.is_vertical](#Corpus+is_vertical) ⇒ <code>Boolean</code>
    * [.is_vertical](#Corpus+is_vertical)
    * [.is_enhanced](#Corpus+is_enhanced) ⇒ <code>Boolean</code>
    * [.filename](#Corpus+filename) ⇒ <code>String</code>
    * [.filename](#Corpus+filename)
    * [.textdata](#Corpus+textdata) ⇒ <code>String</code>
    * [.isParsed](#Corpus+isParsed) ⇒ <code>Boolean</code>
    * [.unparsed](#Corpus+unparsed) ⇒ <code>String</code> \| <code>null</code>
    * [.length](#Corpus+length) ⇒ <code>Number</code>
    * [.current](#Corpus+current) ⇒ <code>nx.Sentence</code> \| <code>null</code>
    * [.index](#Corpus+index) ⇒ <code>Number</code> \| <code>null</code>
    * [.index](#Corpus+index)
    * [.getIndices()](#Corpus+getIndices) ⇒ <code>Object</code>
    * [.serialize()](#Corpus+serialize) ⇒ <code>Object</code>
    * [.convertTo(format)](#Corpus+convertTo) ⇒ <code>String</code>
    * [.afterModifyIndex()](#Corpus+afterModifyIndex)
    * [.first()](#Corpus+first)
    * [.prev()](#Corpus+prev)
    * [.next()](#Corpus+next)
    * [.last()](#Corpus+last)
    * [.getSentence(index)](#Corpus+getSentence) ⇒ <code>nx.Sentence</code> \| <code>null</code>
    * [.setSentence(index, text, main)](#Corpus+setSentence) ⇒ <code>nx.Sentence</code>
    * [.insertSentence(index, text, main)](#Corpus+insertSentence) ⇒ <code>nx.Sentence</code>
    * [.removeSentence(index, main)](#Corpus+removeSentence) ⇒ <code>nx.Sentence</code>
    * [.parse(text, main)](#Corpus+parse) ⇒ <code>nx.Sentence</code>

<a name="new_Corpus_new"></a>

### new Corpus(app, serial)

| Param | Type | Description |
| --- | --- | --- |
| app | [<code>App</code>](#App) | a reference to the parent of this module |
| serial | <code>String</code> \| <code>Object</code> | a serial representation of an nx.Corpus in any format |

<a name="Corpus+format"></a>

### corpus.format ⇒ <code>String</code> \| <code>null</code>
Get the format of the current sentence.  If the sentence is not fully parsed,
 then we return null.

NB: this will never return 'notatrix serial' as the format, even if this was
 most recent serial string given (because we never want the user to see this
 format, which is what we send over the wire).

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+format"></a>

### corpus.format
Set the format of the current sentence (internal, not sanitized).

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  

| Param | Type |
| --- | --- |
| format | <code>String</code> | 

<a name="Corpus+is_ltr"></a>

### corpus.is\_ltr ⇒ <code>Boolean</code>
Get whether the corpus orientation is Left-to-Right (important for the Graph).

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+is_ltr"></a>

### corpus.is\_ltr
Set whether the corpus orientation is Left-to-Right (important for the Graph).

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  

| Param | Type |
| --- | --- |
| bool | <code>Boolean</code> | 

<a name="Corpus+is_vertical"></a>

### corpus.is\_vertical ⇒ <code>Boolean</code>
Get whether the corpus orientation is Top-to-Bottom (important for the Graph).

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+is_vertical"></a>

### corpus.is\_vertical
Set whether the corpus orientation is Top-to-Bottom (important for the Graph).

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  

| Param | Type |
| --- | --- |
| bool | <code>Boolean</code> | 

<a name="Corpus+is_enhanced"></a>

### corpus.is\_enhanced ⇒ <code>Boolean</code>
Get whether the corpus is in 'enhanced' mode (i.e. should display and allow
 us to add multiple heads for each token).

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+filename"></a>

### corpus.filename ⇒ <code>String</code>
Get the filename associated with the corpus.

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+filename"></a>

### corpus.filename
Set the filename associated with the corpus.

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  

| Param | Type |
| --- | --- |
| filename | <code>String</code> | 

<a name="Corpus+textdata"></a>

### corpus.textdata ⇒ <code>String</code>
Returns the string that we should set as the val() of #text-data

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+isParsed"></a>

### corpus.isParsed ⇒ <code>Boolean</code>
Checks whether the current sentence is parsed

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+unparsed"></a>

### corpus.unparsed ⇒ <code>String</code> \| <code>null</code>
Returns the unparsed content of the current sentence

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+length"></a>

### corpus.length ⇒ <code>Number</code>
Returns the number of sentences in the corpus

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+current"></a>

### corpus.current ⇒ <code>nx.Sentence</code> \| <code>null</code>
Returns the currently-focused sentence.  This is useful if another method
 wants to access the internals of the nx.Sentence at this.index.  If there
 are no sentences, it returns null.

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+index"></a>

### corpus.index ⇒ <code>Number</code> \| <code>null</code>
Returns the index of the current sentence in the nx.Corpus.  If there are
 no sentences, it returns null.

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+index"></a>

### corpus.index
Modify the current index to <index>.

**Kind**: instance property of [<code>Corpus</code>](#Corpus)  

| Param | Type |
| --- | --- |
| index | <code>Number</code> | 

<a name="Corpus+getIndices"></a>

### corpus.getIndices() ⇒ <code>Object</code>
Returns the two values that we should set to tell the user what our current
 index is. (current -> #current-sentence, total -> #total-sentences).

**Kind**: instance method of [<code>Corpus</code>](#Corpus)  
**Returns**: <code>Object</code> - { current: Number, total: String }  
<a name="Corpus+serialize"></a>

### corpus.serialize() ⇒ <code>Object</code>
Get a serial representation of the nx.Corpus (useful for saving/sending
 over the wire).

**Kind**: instance method of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+convertTo"></a>

### corpus.convertTo(format) ⇒ <code>String</code>
Get a representation of the current sentence in <format>, ignoring lossiness.
 NB: this function *should* not throw errors because we already check if a
 given conversion will throw errors (in `gui/textarea.js::refresh`)

**Kind**: instance method of [<code>Corpus</code>](#Corpus)  

| Param | Type |
| --- | --- |
| format | <code>String</code> | 

<a name="Corpus+afterModifyIndex"></a>

### corpus.afterModifyIndex()
Helper function to handle broadcasting index modifications and hash updates.
 NB: internal only.

**Kind**: instance method of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+first"></a>

### corpus.first()
Navigate to the first sentence.

**Kind**: instance method of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+prev"></a>

### corpus.prev()
Decrement the current index if possible, otherwise do nothing.

**Kind**: instance method of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+next"></a>

### corpus.next()
Increment the current index if possible, otherwise do nothing.

**Kind**: instance method of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+last"></a>

### corpus.last()
Navigate to the last sentence.

**Kind**: instance method of [<code>Corpus</code>](#Corpus)  
<a name="Corpus+getSentence"></a>

### corpus.getSentence(index) ⇒ <code>nx.Sentence</code> \| <code>null</code>
Get the nx.Sentence at <index>.

**Kind**: instance method of [<code>Corpus</code>](#Corpus)  

| Param | Type |
| --- | --- |
| index | <code>Number</code> | 

<a name="Corpus+setSentence"></a>

### corpus.setSentence(index, text, main) ⇒ <code>nx.Sentence</code>
Set a serial value for the nx.Sentence at <index>.

**Kind**: instance method of [<code>Corpus</code>](#Corpus)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| index | <code>Number</code> |  |  |
| text | <code>String</code> \| <code>Object</code> |  |  |
| main | <code>Boolean</code> | <code>true</code> | whether or not to broadcast updates |

<a name="Corpus+insertSentence"></a>

### corpus.insertSentence(index, text, main) ⇒ <code>nx.Sentence</code>
Insert an nx.Sentence (with serial value <text>) after <index>.

**Kind**: instance method of [<code>Corpus</code>](#Corpus)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| index | <code>Number</code> |  |  |
| text | <code>String</code> \| <code>Object</code> |  |  |
| main | <code>Boolean</code> | <code>true</code> | whether or not to broadcast updates |

<a name="Corpus+removeSentence"></a>

### corpus.removeSentence(index, main) ⇒ <code>nx.Sentence</code>
Remove the nx.Sentence at <index>.

**Kind**: instance method of [<code>Corpus</code>](#Corpus)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| index | <code>Number</code> |  |  |
| main | <code>Boolean</code> | <code>true</code> | whether or not to broadcast updates |

<a name="Corpus+parse"></a>

### corpus.parse(text, main) ⇒ <code>nx.Sentence</code>
Split the incoming text (on double newlines or punctuation).  The first
 item will overwrite the current sentence, with sentences inserted seqntially
 thereafter.

**Kind**: instance method of [<code>Corpus</code>](#Corpus)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| text | <code>String</code> \| <code>Object</code> |  |  |
| main | <code>Boolean</code> | <code>true</code> | whether or not to broadcast updates |

<a name="Server"></a>

## Server
Abstraction over an AJAX connection.  Handles sending and receiving large
 packets from a server.  Usually, this means the initial loading of the
	corpus, as well as saving (including (de)serialization).

**Kind**: global class  

* [Server](#Server)
    * [new Server(app)](#new_Server_new)
    * [.connect()](#Server+connect)
    * [.save(serial)](#Server+save)
    * [.load()](#Server+load)

<a name="new_Server_new"></a>

### new Server(app)

| Param | Type | Description |
| --- | --- | --- |
| app | [<code>App</code>](#App) | a reference to the parent of this module. |

<a name="Server+connect"></a>

### server.connect()
Attempt to connect to the server via AJAX.  This function updates the
	<tt>Server.is_running<\tt> attribute, which is checked by other functions.

**Kind**: instance method of [<code>Server</code>](#Server)  
<a name="Server+save"></a>

### server.save(serial)
Save a JSON object containing a serial representation of the corpus to the
 server (if running).

**Kind**: instance method of [<code>Server</code>](#Server)  

| Param | Type |
| --- | --- |
| serial | <code>Object</code> | 

<a name="Server+load"></a>

### server.load()
Attempt to load a serial representation of the corpus from the server.

**Kind**: instance method of [<code>Server</code>](#Server)  
<a name="Socket"></a>

## Socket
Abstraction over a SocketIO connection.  Handles sending and receiving small
 packets from a server.

NB: this handles all server communication except for the (de)serialization of
 the corpus (this is handled via AJAX calls).

**Kind**: global class  

* [Socket](#Socket)
    * [new Socket(app)](#new_Socket_new)
    * [.connect()](#Socket+connect)
    * [.broadcast(name, data)](#Socket+broadcast)

<a name="new_Socket_new"></a>

### new Socket(app)

| Param | Type | Description |
| --- | --- | --- |
| app | [<code>App</code>](#App) | a reference to the parent of this module. |

<a name="Socket+connect"></a>

### socket.connect()
Make a connection to the server and set callbacks for the various messages
 we expect to receive.

**Kind**: instance method of [<code>Socket</code>](#Socket)  
<a name="Socket+broadcast"></a>

### socket.broadcast(name, data)
Broadcast (/emit) a packet of type <name> with arguments <data> to the server.

**Kind**: instance method of [<code>Socket</code>](#Socket)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | the name of the event we want to notify the server of |
| data | <code>Object</code> | any other arguments for the event |

<a name="CollaborationInterface"></a>

## CollaborationInterface
Abstraction to help with handling multiple users collaborating on a document.
 This module takes care of maintaining:
 - the current user
 - a list of all current users on this document
 - methods for getting the mice and locks for those users

**Kind**: global class  

* [CollaborationInterface](#CollaborationInterface)
    * [new CollaborationInterface(app)](#new_CollaborationInterface_new)
    * [.size](#CollaborationInterface+size) ⇒ <code>Number</code>
    * [.setSelf(data)](#CollaborationInterface+setSelf)
    * [.getUser(id)](#CollaborationInterface+getUser) ⇒ [<code>User</code>](#User)
    * [.addUser(data, alert)](#CollaborationInterface+addUser)
    * [.removeUser(data, alert)](#CollaborationInterface+removeUser)
    * [.getMouseNodes()](#CollaborationInterface+getMouseNodes) ⇒ <code>Array</code>
    * [.getLocks()](#CollaborationInterface+getLocks) ⇒ <code>Array</code>

<a name="new_CollaborationInterface_new"></a>

### new CollaborationInterface(app)

| Param | Type | Description |
| --- | --- | --- |
| app | [<code>App</code>](#App) | a reference to the parent of this module |

<a name="CollaborationInterface+size"></a>

### collaborationInterface.size ⇒ <code>Number</code>
Return the number of online users.

**Kind**: instance property of [<code>CollaborationInterface</code>](#CollaborationInterface)  
<a name="CollaborationInterface+setSelf"></a>

### collaborationInterface.setSelf(data)
Save data about the current user.  This method is called after we establish
 a connection with our socket server.

**Kind**: instance method of [<code>CollaborationInterface</code>](#CollaborationInterface)  

| Param | Type |
| --- | --- |
| data | <code>Object</code> | 

<a name="CollaborationInterface+getUser"></a>

### collaborationInterface.getUser(id) ⇒ [<code>User</code>](#User)
Get a User object by <id>.

**Kind**: instance method of [<code>CollaborationInterface</code>](#CollaborationInterface)  

| Param | Type |
| --- | --- |
| id | <code>String</code> | 

<a name="CollaborationInterface+addUser"></a>

### collaborationInterface.addUser(data, alert)
Add a User to our list.

**Kind**: instance method of [<code>CollaborationInterface</code>](#CollaborationInterface)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | the data to pass on to the User constructor |
| alert | <code>Boolean</code> | <code>true</code> | (optional, default=true) whether we should log to chat |

<a name="CollaborationInterface+removeUser"></a>

### collaborationInterface.removeUser(data, alert)
Remove a User from our list.

**Kind**: instance method of [<code>CollaborationInterface</code>](#CollaborationInterface)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | <code>Object</code> |  | the data get the User by |
| alert | <code>Boolean</code> | <code>true</code> | (optional, default=true) whether we should log to chat |

<a name="CollaborationInterface+getMouseNodes"></a>

### collaborationInterface.getMouseNodes() ⇒ <code>Array</code>
Get a list of mouse nodes (each with a user id, position (x & y coords), and
 hex color code), at most one per user.  Mice are only shown for users on
 the same page (i.e. same corpus index) as this.self.

**Kind**: instance method of [<code>CollaborationInterface</code>](#CollaborationInterface)  
**Returns**: <code>Array</code> - [{ id: String, position: { x: Number, y: Number }, color: String }]  
<a name="CollaborationInterface+getLocks"></a>

### collaborationInterface.getLocks() ⇒ <code>Array</code>
Get a list of node locks (each with a user id, cytoscape selector, and
 hex color code), at most one per user.  Locks are only shown for users on
 the same page (i.e. same corpus index) as this.self.

**Kind**: instance method of [<code>CollaborationInterface</code>](#CollaborationInterface)  
**Returns**: <code>Array</code> - [{ id: String, locked: String, color: String }]  
<a name="User"></a>

## User
Data structure to keep track of state and methods associated with a particular
 socket connection.

NB: the data parameter should contain
 - username (optional): the GitHub account associated with this connection
 - id: user identifier, shared with the server
 - address: IP Address of the connection
 - index: the corpus index on this user's page
 - mouse: the x, y coordinates of the user's mouse (within #cy)
 - locked: a cytoscape selector to locate the node currently being edited

**Kind**: global class  

* [User](#User)
    * [new User(data)](#new_User_new)
    * [.viewing](#User+viewing) ⇒ <code>String</code>
    * [.viewing](#User+viewing)
    * [.setMouse(pos)](#User+setMouse)
    * [.dom()](#User+dom) ⇒ <code>HTMLElement</code>

<a name="new_User_new"></a>

### new User(data)

| Param | Type |
| --- | --- |
| data | <code>Object</code> | 

<a name="User+viewing"></a>

### user.viewing ⇒ <code>String</code>
Helper function for `this::dom`, gives the index-part associated with a
 user in #chat.

**Kind**: instance property of [<code>User</code>](#User)  
<a name="User+viewing"></a>

### user.viewing
Wrapper for setting the corpus index of the user.  Sanitizes input.

**Kind**: instance property of [<code>User</code>](#User)  

| Param | Type |
| --- | --- |
| index | <code>Number</code> | 

<a name="User+setMouse"></a>

### user.setMouse(pos)
Wrapper for setting the mosue position of the user.  Sanitizes input.

**Kind**: instance method of [<code>User</code>](#User)  

| Param | Type | Description |
| --- | --- | --- |
| pos | <code>Object</code> | { x: Number, y: Number } |

<a name="User+dom"></a>

### user.dom() ⇒ <code>HTMLElement</code>
Get a DOM object containing some of the user's data (this gets rendered in #chat)

NB: this looks a bit messy, but it should have this structure:
 <span class="message-sender-info" name="{ id }">
   <i class="message-color-blob fa fa-circle" style="color: #{ color };" />
   <span class="message-sender-name" title="IP Address: { ip }">
     { name }
   </span>
   <span class="message-sender-viewing" title="Currently viewing">
     { viewing }
   </span>
 </span>

**Kind**: instance method of [<code>User</code>](#User)  
<a name="Graph"></a>

## Graph
Abstraction over the graph editor.  Handles interaction between the graph
 and the user.  For example, all the event handlers are here, the methods that
 draw the graph, and the methods that place the mice / locks.

**Kind**: global class  

* [Graph](#Graph)
    * [new Graph(app)](#new_Graph_new)
    * [.eles](#Graph+eles) ⇒ <code>Array</code>
    * [.draw()](#Graph+draw) ⇒ [<code>Graph</code>](#Graph)
    * [.bind()](#Graph+bind) ⇒ [<code>Graph</code>](#Graph)
    * [.save()](#Graph+save)
    * [.load()](#Graph+load)
    * [.commit()](#Graph+commit)
    * [.clear()](#Graph+clear)
    * [.makeDependency(src, tar)](#Graph+makeDependency)
    * [.modifyDependency(ele, deprel)](#Graph+modifyDependency)
    * [.removeDependency(ele)](#Graph+removeDependency)
    * [.toggleIsEmpty(ele)](#Graph+toggleIsEmpty)
    * [.setRoot(ele)](#Graph+setRoot)
    * [.splitToken(ele, index)](#Graph+splitToken)
    * [.splitSuperToken(ele)](#Graph+splitSuperToken)
    * [.combine(src, tar)](#Graph+combine)
    * [.merge(src, tar)](#Graph+merge)
    * [.getPrevForm()](#Graph+getPrevForm) ⇒ <code>RectObject</code> \| <code>undefined</code>
    * [.getNextForm()](#Graph+getNextForm) ⇒ <code>RectObject</code> \| <code>undefined</code>
    * [.selectPrevEle()](#Graph+selectPrevEle)
    * [.selectNextEle()](#Graph+selectNextEle)
    * [.flashTokenSplitInput()](#Graph+flashTokenSplitInput)
    * [.showEditLabelBox()](#Graph+showEditLabelBox)
    * [.drawMice()](#Graph+drawMice)
    * [.setLocks()](#Graph+setLocks)
    * [.lock(ele)](#Graph+lock)
    * [.unlock()](#Graph+unlock)

<a name="new_Graph_new"></a>

### new Graph(app)

| Param | Type | Description |
| --- | --- | --- |
| app | [<code>App</code>](#App) | a reference to the parent of this module |

<a name="Graph+eles"></a>

### graph.eles ⇒ <code>Array</code>
Build a list of elements, both nodes and edges.  This function
 also validates all the elements.

**Kind**: instance property of [<code>Graph</code>](#Graph)  
**Returns**: <code>Array</code> - [Object]  
<a name="Graph+draw"></a>

### graph.draw() ⇒ [<code>Graph</code>](#Graph)
Create the cytoscape instance and populate it with the nodes and edges we
generate in `this.eles`.

**Kind**: instance method of [<code>Graph</code>](#Graph)  
**Returns**: [<code>Graph</code>](#Graph) - (chaining)  
<a name="Graph+bind"></a>

### graph.bind() ⇒ [<code>Graph</code>](#Graph)
Bind event handlers to the cytoscape elements and the enclosing canvas.

**Kind**: instance method of [<code>Graph</code>](#Graph)  
**Returns**: [<code>Graph</code>](#Graph) - (chaining)  
<a name="Graph+save"></a>

### graph.save()
Save the current graph config to `localStorage`.

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+load"></a>

### graph.load()
Load the graph config from `localStorage` if it exists.

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+commit"></a>

### graph.commit()
Save in-progress changes to the graph (labels being edited).

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+clear"></a>

### graph.clear()
Remove all the graph state that would indicate we're in the process of
 editing a label or activating a particular element.

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+makeDependency"></a>

### graph.makeDependency(src, tar)
Try to add `src` as a head for `tar`, save changes, and update graph.

**Kind**: instance method of [<code>Graph</code>](#Graph)  

| Param | Type |
| --- | --- |
| src | <code>BaseToken</code> | 
| tar | <code>BaseToken</code> | 

<a name="Graph+modifyDependency"></a>

### graph.modifyDependency(ele, deprel)
Try to change the deprel for the dependency given by `ele` to `deprel`, save
 changes, and update graph.

**Kind**: instance method of [<code>Graph</code>](#Graph)  

| Param | Type |
| --- | --- |
| ele | <code>PathObject</code> | 
| deprel | <code>String</code> | 

<a name="Graph+removeDependency"></a>

### graph.removeDependency(ele)
Try to remove the dependency given by `ele`, save changes, and update graph.

**Kind**: instance method of [<code>Graph</code>](#Graph)  

| Param | Type |
| --- | --- |
| ele | <code>PathObject</code> | 

<a name="Graph+toggleIsEmpty"></a>

### graph.toggleIsEmpty(ele)
Toggle whether `ele` is an empty node, save changes, and update the graph

**Kind**: instance method of [<code>Graph</code>](#Graph)  

| Param | Type |
| --- | --- |
| ele | <code>BaseToken</code> | 

<a name="Graph+setRoot"></a>

### graph.setRoot(ele)
Try to set `ele` as the root of the sentence, save changes, and update graph.

**Kind**: instance method of [<code>Graph</code>](#Graph)  

| Param | Type |
| --- | --- |
| ele | <code>BaseToken</code> | 

<a name="Graph+splitToken"></a>

### graph.splitToken(ele, index)
Try to the token given by `ele` as `index`, save changes, and update graph.

**Kind**: instance method of [<code>Graph</code>](#Graph)  

| Param | Type |
| --- | --- |
| ele | <code>BaseToken</code> | 
| index | <code>Number</code> | 

<a name="Graph+splitSuperToken"></a>

### graph.splitSuperToken(ele)
Try to the superToken given by `ele` into normal tokens save changes, and
 update graph.

**Kind**: instance method of [<code>Graph</code>](#Graph)  

| Param | Type |
| --- | --- |
| ele | <code>BaseToken</code> | 

<a name="Graph+combine"></a>

### graph.combine(src, tar)
Try to combine `src` and `tar` into a superToken, save changes, and update
 graph.

**Kind**: instance method of [<code>Graph</code>](#Graph)  

| Param | Type |
| --- | --- |
| src | <code>BaseToken</code> | 
| tar | <code>BaseToken</code> | 

<a name="Graph+merge"></a>

### graph.merge(src, tar)
Try to merge `src` and `tar` into a single normal token, save changes, and
 update graph.

**Kind**: instance method of [<code>Graph</code>](#Graph)  

| Param | Type |
| --- | --- |
| src | <code>BaseToken</code> | 
| tar | <code>BaseToken</code> | 

<a name="Graph+getPrevForm"></a>

### graph.getPrevForm() ⇒ <code>RectObject</code> \| <code>undefined</code>
Get the `previous` form relative to the activated form (no wrapping).  This
 is useful for when we want to get the neighbors of a node (e.g. for merge
 or combine).  The `previous` form is the `form-node` with `clump` one less.
 If there is no `previous` form, returns undefined.

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+getNextForm"></a>

### graph.getNextForm() ⇒ <code>RectObject</code> \| <code>undefined</code>
Get the `next` form relative to the activated form (no wrapping).  This
 is useful for when we want to get the neighbors of a node (e.g. for merge
 or combine).  The `next` form is the `form-node` with `clump` one greater.
 If there is no `next` form, returns undefined.

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+selectPrevEle"></a>

### graph.selectPrevEle()
Show #edit on the `previous` cytoscape element, determined by the order it
 was drawn to the graph.

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+selectNextEle"></a>

### graph.selectNextEle()
Show #edit on the `next` cytoscape element, determined by the order it
 was drawn to the graph.

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+flashTokenSplitInput"></a>

### graph.flashTokenSplitInput()
Flash the #edit box, but stay in `splitting` mode (this affects what happens
 during `commit`).

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+showEditLabelBox"></a>

### graph.showEditLabelBox()
Flash the #edit box around the current `input` node.  Also locks the target
 and flashes the #mute.

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+drawMice"></a>

### graph.drawMice()
Add `mouse` nodes for each of the users on the current corpus index.

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+setLocks"></a>

### graph.setLocks()
Add the `locked` class to each of the elements being edited by other users
 on the current corpus index.

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Graph+lock"></a>

### graph.lock(ele)
Add a lock to `ele`, save it to the config, and broadcast it to the other
 users.

**Kind**: instance method of [<code>Graph</code>](#Graph)  

| Param | Type |
| --- | --- |
| ele | <code>PathObject</code> \| <code>RectObject</code> | 

<a name="Graph+unlock"></a>

### graph.unlock()
Remove the lock for the current user, save and broadcast.

**Kind**: instance method of [<code>Graph</code>](#Graph)  
<a name="Chat"></a>

## Chat
Abstraction to deal with interaction with #chat element and its descendents.
 Handles outgoing and incoming messages and alerts, event callbacks, and
 updating user spans.

**Kind**: global class  

* [Chat](#Chat)
    * [new Chat(gui)](#new_Chat_new)
    * [.alert(message, users)](#Chat+alert)
    * [.sendMessage(collab)](#Chat+sendMessage)
    * [.newMessage(user, text, self)](#Chat+newMessage)
    * [.updateUser(user)](#Chat+updateUser)
    * [.refresh()](#Chat+refresh)
    * [.bind()](#Chat+bind)

<a name="new_Chat_new"></a>

### new Chat(gui)

| Param | Type | Description |
| --- | --- | --- |
| gui | [<code>GUI</code>](#GUI) | reference to the parent |

<a name="Chat+alert"></a>

### chat.alert(message, users)
Add an "alert" to the #chat.  Alert messages show up centrally aligned in
 the #chat.  This method also escapes '%u' strings in the message and
 replaces them with the `User::dom`.

**Kind**: instance method of [<code>Chat</code>](#Chat)  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | message to be alerted |
| users | <code>Array</code> | [User] list of users to be interleaved |

<a name="Chat+sendMessage"></a>

### chat.sendMessage(collab)
Send a message from the current user to the chat.  Also broadcasts the
 message to the other users.

**Kind**: instance method of [<code>Chat</code>](#Chat)  

| Param | Type |
| --- | --- |
| collab | [<code>CollaborationInterface</code>](#CollaborationInterface) | 

<a name="Chat+newMessage"></a>

### chat.newMessage(user, text, self)
Add a message to #chat with content `text` from `user`.  If `self == true`,
 then the message will be right-aligned.  Otherwise, it will be left-
 aligned.

**Kind**: instance method of [<code>Chat</code>](#Chat)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| user | [<code>User</code>](#User) |  |  |
| text | <code>String</code> |  |  |
| self | <code>Boolean</code> | <code>false</code> | (optional, default = `false`) |

<a name="Chat+updateUser"></a>

### chat.updateUser(user)
Scan through #chat and update each `.message-sender-info` span for the given
 `user` to use the most recent values of `user.name` and `user.viewing`.

**Kind**: instance method of [<code>Chat</code>](#Chat)  

| Param | Type |
| --- | --- |
| user | [<code>User</code>](#User) | 

<a name="Chat+refresh"></a>

### chat.refresh()
Force to redraw #chat based on our internal state.  Called every time there
 is a change.

**Kind**: instance method of [<code>Chat</code>](#Chat)  
<a name="Chat+bind"></a>

### chat.bind()
Bind callbacks.

**Kind**: instance method of [<code>Chat</code>](#Chat)  
<a name="GUI"></a>

## GUI
Abstraction over the user interface.  Handles interaction between user via
 DOM elements & keystrokes and the application instance.

**Kind**: global class  

* [GUI](#GUI)
    * [new GUI(app)](#new_GUI_new)
    * [.save()](#GUI+save)
    * [.load()](#GUI+load)
    * [.bind()](#GUI+bind)
    * [.refresh()](#GUI+refresh)

<a name="new_GUI_new"></a>

### new GUI(app)

| Param | Type | Description |
| --- | --- | --- |
| app | [<code>App</code>](#App) | a reference to the parent of this module |

<a name="GUI+save"></a>

### guI.save()
Save the GUI preferences to localStorage

**Kind**: instance method of [<code>GUI</code>](#GUI)  
<a name="GUI+load"></a>

### guI.load()
Load the GUI preferences from localStorage

**Kind**: instance method of [<code>GUI</code>](#GUI)  
<a name="GUI+bind"></a>

### guI.bind()
Bind DOM elements to user keystrokes recursively

**Kind**: instance method of [<code>GUI</code>](#GUI)  
<a name="GUI+refresh"></a>

### guI.refresh()
Called after any change to application state.  Refreshes the view of the
 application by recursively refreshing subelements.

**Kind**: instance method of [<code>GUI</code>](#GUI)  
<a name="detectFormat"></a>

## detectFormat(serial) ⇒ <code>String</code> \| <code>null</code>
Helper function for Corpus.  Attempts to detect the format of a given serial
 string/object.  If it can't detect one, it returns null.  If it detects one
 or more, it follows a simple resolution algorithm to pick one.

**Kind**: global function  
**Returns**: <code>String</code> \| <code>null</code> - the string name of the detected format  

| Param | Type |
| --- | --- |
| serial | <code>String</code> \| <code>Object</code> | 

<a name="vertical"></a>

## vertical(n1, n2)
Function to sort nodes with vertical orientation.

**Kind**: global function  

| Param | Type |
| --- | --- |
| n1 | <code>CytoscapeNode</code> | 
| n2 | <code>CytoscapeNode</code> | 

<a name="ltr"></a>

## ltr(n1, n2)
Function to sort nodes with left-to-right orientation.

**Kind**: global function  

| Param | Type |
| --- | --- |
| n1 | <code>CytoscapeNode</code> | 
| n2 | <code>CytoscapeNode</code> | 

<a name="rtl"></a>

## rtl(n1, n2)
Function to sort nodes with right-to-left orientation.

**Kind**: global function  

| Param | Type |
| --- | --- |
| n1 | <code>CytoscapeNode</code> | 
| n2 | <code>CytoscapeNode</code> | 

<a name="bind"></a>

## bind(eles)
Bind the elements to the internal reference.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| eles | <code>Array</code> | List of both nodes and edges |

<a name="run"></a>

## run()
Main function that runs all of the
subfunctions needed to generate the graph.

**Kind**: global function  
<a name="drawNodes"></a>

## drawNodes()
Draws the nodes on the svg.

**Kind**: global function  
<a name="drawDeprels"></a>

## drawDeprels()
Draws deprels.

**Kind**: global function  
<a name="tokenDist"></a>

## tokenDist(id)
Returns the token distance for a deprel.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | dep_[num1]_[num2] |

<a name="curve"></a>

## curve(initialOffset, ypos1, xpos2, dir, rectWidth, h, height)
Generates curve for deprel.
The curve starts at initialOffset (M) and consists of a
straight line (L) that goes into a cubic curve (C) which
then goes into a straight line (L) to rectLeft. Then we
leave a gap for the label and start the other half at
rectRight (M) and the same idea follows again.
Here, • denotes a control point used.
        •   •   • label •   •   •

      •                           •

    •                                •

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| initialOffset | <code>int</code> | x-position of source (offset) |
| ypos1 | <code>int</code> | y-position of tokens |
| xpos2 | <code>int</code> | x-position of target |
| dir | <code>int</code> | 1 or 1 |
| rectWidth | <code>int</code> | width of label |
| h | <code>int</code> | scaled height of deprel |
| height | <code>int</code> | actual height of the deprel |

<a name="getHeights"></a>

## getHeights(deprels)
Calculates the heights for each deprel.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| deprels | <code>Array</code> | Array of deprels |

<a name="latex"></a>

## latex(app) ⇒ <code>String</code>
Export an application instance to LaTeX format.  The client will be prompted
 to download the file.

**Kind**: global function  

| Param | Type |
| --- | --- |
| app | [<code>App</code>](#App) | 

<a name="png"></a>

## png(app)
Export an application instance to PNG format.  The client will be prompted to
 download the file.

**Kind**: global function  

| Param | Type |
| --- | --- |
| app | [<code>App</code>](#App) | 

<a name="svg"></a>

## svg(app)
Export an application instance to SVG format.  The client will be prompted to
 download the file.

**Kind**: global function  

| Param | Type |
| --- | --- |
| app | [<code>App</code>](#App) | 

