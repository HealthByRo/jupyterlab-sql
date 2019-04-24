import * as React from 'react';

import { ISignal, Signal } from '@phosphor/signaling';

import { VDomModel, VDomRenderer } from '@jupyterlab/apputils';

import classNames from 'classNames';

export interface IConnectionPageToolbarModel {
  readonly connectionUrl: string;
  readonly connect: ISignal<this, string>;
  readonly connectionUrlChanged: ISignal<this, string>;
}

export function newToolbar(model: ConnectionPageToolbarModel): ToolbarContainer {
  const container = new ToolbarContainer();
  container.model = model;
  return container;
}

export class ConnectionPageToolbarModel extends VDomModel implements IConnectionPageToolbarModel {
  constructor(initialConnectionUrl: string) {
    super();
    this._connectionUrl = initialConnectionUrl;
  }

  tryConnect(connectionUrl: string): void {
    this._connect.emit(connectionUrl)
  }

  get connectionUrl(): string {
    return this._connectionUrl;
  }

  set connectionUrl(newValue: string) {
    this._connectionUrl = newValue;
    this._connectionUrlChanged.emit(newValue);
  }

  get connect(): ISignal<this, string> {
    return this._connect;
  }

  get connectionUrlChanged(): ISignal<this, string> {
    return this._connectionUrlChanged;
  }

  private _connectionUrl: string;
  private readonly _connectionUrlChanged = new Signal<this, string>(this);
  private readonly _connect = new Signal<this, string>(this);
}

class ToolbarContainer extends VDomRenderer<ConnectionPageToolbarModel> {
  render() {
    if (!this.model) {
      return null;
    } else {
      const connectionUrl = this.model.connectionUrl
      return (
        <div className="p-Sql-Toolbar">
          <ConnectionInformationEdit
            initialConnectionUrl={connectionUrl}
            onConnectionUrlChanged={newConnectionUrl => this.model.connectionUrl = newConnectionUrl}
            onFinishEdit={currentConnectionUrl => this.model.tryConnect(currentConnectionUrl)}
          />
        </div>
      );
    }
  }
}


class ConnectionInformationEdit extends React.Component<
  ConnectionInformationEdit.Props,
  ConnectionInformationEdit.State
  > {
  constructor(props: ConnectionInformationEdit.Props) {
    super(props);
    this.state = {
      connectionUrl: props.initialConnectionUrl,
      focused: false
    };
  }

  private inputRef = React.createRef<HTMLInputElement>();

  onKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
    if (event.key === 'Enter') {
      this.inputRef.current!.blur();
    } else if (event.keyCode === 27) {
      // ESC key
      this.cancel();
    }
  }

  onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newConnectionUrl = event.target.value;
    this.props.onConnectionUrlChanged(newConnectionUrl);
    this.setState({ connectionUrl: newConnectionUrl });
  }

  start() {
    this.setState({
      focused: true
    });
  }

  finish() {
    this.props.onFinishEdit(this.state.connectionUrl);
    this.setState({
      focused: false
    });
  }

  cancel() {
    const newConnectionUrl = this.props.initialConnectionUrl;
    this.props.onConnectionUrlChanged(newConnectionUrl);
    this.setState({ connectionUrl: newConnectionUrl });
  }

  onInputFocus() {
    this.start();
  }

  onInputBlur() {
    this.finish();
  }

  componentDidMount() {
    this.inputRef.current!.focus();
  }

  render() {
    const { connectionUrl, focused } = this.state;
    const inputWrapperClass = classNames(
      'p-Sql-ConnectionInformation-input-wrapper',
      { 'p-mod-focused': focused }
    );
    return (
      <div className={inputWrapperClass}>
        <input
          className="p-Sql-ConnectionInformation-text p-Sql-ConnectionInformation-input"
          value={connectionUrl}
          ref={this.inputRef}
          onChange={event => this.onChange(event)}
          onKeyDown={event => this.onKeyDown(event)}
          onBlur={() => this.onInputBlur()}
          onFocus={() => this.onInputFocus()}
        />
      </div>
    );
  }
}

namespace ConnectionInformationEdit {
  export interface Props {
    initialConnectionUrl: string;
    onFinishEdit: (newConnectionUrl: string) => void;
    onConnectionUrlChanged: (newConnectionString: string) => void;
  }

  export interface State {
    connectionUrl: string;
    focused: boolean;
  }
}
