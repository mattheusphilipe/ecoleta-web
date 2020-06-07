import React from 'react';
import './styles.css';
import { FiArrowLeft } from 'react-icons/fi';
import logo from '../../assets/logo.svg';
import { Link } from 'react-router-dom'

const CreateCollectPoint = ({}) => {


    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta Logo"/>
                <Link to="/"><FiArrowLeft /> Voltar para Home</Link>

            </header>
            <form>
                <h1>Cadastro do <br /> ponto de coleta</h1>
        
                <fieldset>
                    <legend> <h2>Dados </h2> </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                        type="text"
                        name="name"
                        id="name"
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                            type="email"
                            name="email"
                            id="email"
                            />

                        </div>

                       <div className="field">
                        <label htmlFor="name">Celular</label>
                            <input 
                            type="text"
                            name="celular"
                            id="celular"
                            />

                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend> 
                        <h2>Endereço </h2> 
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <div className="field-group">
                    <div className="field">
                             <label htmlFor="zil-code">CEP</label>
                                <input 
                                    type="text"
                                    name="zip-code"
                                    id="zip-code"
                                />
                        </div>

                        <div className="field">
                             <label htmlFor="cidade">Bairro</label>
                                <input 
                                    type="text"
                                    name="cidade"
                                    id="cidade"
                                />
                        </div>
                    </div>

                    <div className="field-group">
                       
                    <div className="field">
                                <label htmlFor="rua">Rua</label>
                                    <input 
                                        type="text"
                                        name="rua"
                                        id="rua"
                                    />
                            </div>

                        <div className="field">
                             <label htmlFor="numero">Número</label>
                                <input 
                                    type="number"
                                    name="numero"
                                    id="numero"
                                />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="uf">Estado</label>
                        <select name="uf" id="uf">
                            <option value="0">Selecione uma UF</option>
                        </select>
                                 
                    </div>
                    
                    <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="ufcity">
                            <option value="0">Selecione uma cidade</option>
                        </select>
                    </div>
                    
                </fieldset>
                <fieldset>
                    <legend> 
                        <h2>Itens de Coleta </h2> 
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                  
                  <ul className="items-grid">
                      <li>
                          <img src="http://localhost:3232/uploads/oleo.svg" alt="item de coleta"/>
                          <span>Óleo de Cozinha</span>
                      </li>
                      <li className="selected">
                          <img src="http://localhost:3232/uploads/oleo.svg" alt="item de coleta"/>
                          <span>Óleo de Cozinha</span>
                      </li>
                      <li>
                          <img src="http://localhost:3232/uploads/oleo.svg" alt="item de coleta"/>
                          <span>Óleo de Cozinha</span>
                      </li>
                      <li>
                          <img src="http://localhost:3232/uploads/oleo.svg" alt="item de coleta"/>
                          <span>Óleo de Cozinha</span>
                      </li>
                      <li>
                          <img src="http://localhost:3232/uploads/oleo.svg" alt="item de coleta"/>
                          <span>Óleo de Cozinha</span>
                      </li>
                      <li>
                          <img src="http://localhost:3232/uploads/oleo.svg" alt="item de coleta"/>
                          <span>Óleo de Cozinha</span>
                      </li>
                  </ul>
                    
                </fieldset>

                <button type="submit"> Cadastrar ponto de coleta</button>
            </form>
        </div>
    )
}

export default CreateCollectPoint;