import React, {useState, useEffect, ChangeEvent} from 'react';
import './styles.css';
import { FiArrowLeft } from 'react-icons/fi';
import logo from '../../assets/logo.svg';
import { Link } from 'react-router-dom'
import { Map, TileLayer, Marker } from 'react-leaflet';
import {LeafletMouseEvent} from 'leaflet';
import api from '../../services/api';
import axios from 'axios';
interface CollectItem {
    id: number;
    title: string;
    image_url: string;
}

interface Regiao {
    id: number;
    nome: string;
    sigla: string;
}

interface Estado {
    nome: string;
    sigla: string;
    id: number,
    regiao: Regiao;
}

const CreateCollectPoint = () => {
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>(initialPosition);
    const [collectItems, setCollectItems] = useState<CollectItem[]>([]);
    const [city, setCity] = useState<string>('');
    const [estados, setEstados] = useState<Estado[]>([]);
    const [estado, setEstado] = useState<string>('');
    const [citys, setCitys] = useState<[]>([]);
    const [selectedCollectItem, setSelectedCollectItem] = useState<number[]>([]);
    const [loadingCity, setLoadingCity] = useState<boolean>(false);
    const [loadingForm, setLoadingForm] = useState<boolean>(false);
    const [formData, setFormaData] = useState({
        name: '',
        celular: '',
        email: '',
        numero: 0,
        rua: '',
        bairro: '',
        "zip-code": '',

    })

    useEffect(() => 
    {

        api.get<CollectItem[]>('collect_items')
        .then((response) => 
        {
            console.log(response.data)
          if (response.status === 200) 
          {
            setCollectItems(response.data)
          }      
        })
        .catch(err => console.error(err));
        
        axios.get<Estado[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then((response) => 
        {
          if (response.status === 200) 
          {
            setEstados(response.data)
          }      
        })

        .catch(err => console.error(err));

        navigator.geolocation.getCurrentPosition(position => 
            {
                setInitialPosition([position.coords.latitude, position.coords.longitude])              
            }
        )

    }, [])

    useEffect(() => 
    {
        setLoadingCity(true);

        axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios`)
        .then((response) => 
        {
          if (response.status === 200) 
          {
            setCitys(response.data)
          }      
          setLoadingCity(false);
        })
        .catch(err => {
            console.error(err)
            setLoadingCity(false);
        });

    }, [estado]);


    const handleSelectedItem = (event: any) => {
        const {value} = event.currentTarget;

        if (!value) {
            return;
        }
        
        const alreadySelected = selectedCollectItem.includes(value)
        const newSelectedItems = [...selectedCollectItem];

        if (alreadySelected) {
            const indexItem = selectedCollectItem.indexOf(value);
            newSelectedItems.splice(indexItem, 1);
        } else {
            newSelectedItems.push(value);
        }

        setSelectedCollectItem(newSelectedItems);
    }

    const handleSelectedState = (event: ChangeEvent<HTMLSelectElement>) => {
        const {value, id} = event.target;

        if (!value || !id) {
            return;
        }

        if (id === 'city') {
            setCity(value);
            return;
        }

        setEstado(value);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        if (!event) {
            return;
        }

        const {latlng} = event;
        console.log([latlng.lat, latlng.lng])
        setSelectedPosition([latlng.lat, latlng.lng]);
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => 
    { const {value, name} = event.target;

      if(!value || !name) {
          return;
      } 

      console.log(value, name)

      setFormaData({...formData, [name]: value})

    }

    const handleSubmit = (event: any) => {
        event.preventDefault();
        
        setLoadingForm(true);

        const {name, email, rua, bairro, numero} = formData;
        const [latitude, longitude] = selectedPosition;

        console.log(formData, estado, city)
        console.log(latitude, longitude, selectedCollectItem);

        if (!selectedCollectItem.length) {
            alert('Pelo menos um item de coleta deve ser selecionado');
            setLoadingForm(false);
            return;
        }

        const data = {
             name,
            email,
            UF: estado,
            city,
            neighborhood: bairro,
            street: rua,
            "zip_code": formData['zip-code'],
            addressNumber: numero,
            latitude,
            longitude,
            items: selectedCollectItem,
        }

        api.post('collect_points', data)
        .then((response) => 
        {   console.log(response)
            if (response.status === 200) {
                alert('Ponto de coleta cadastrado com sucesso!');
                window.location.assign('/');
            }
            setLoadingForm(false);  
        })
        .catch(err => {
            console.error(err);
            setLoadingForm(false);  
            alert('Erro ao cadastrar o ponto de coleta!');
        });
        
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta Logo"/>
                <Link to="/"><FiArrowLeft /> Voltar para Home</Link>

            </header>
            <form method="post" onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>
        
                <fieldset>
                    <legend> <h2>Dados </h2> </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade*</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            required
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail*</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                required
                                onChange={handleInputChange}
                            />

                        </div>

                       <div className="field">
                        <label htmlFor="name">Celular*</label>
                            <input 
                                type="text"
                                name="celular"
                                id="celular"
                                required
                                onChange={handleInputChange}
                            />

                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend> 
                        <h2>Endereço </h2> 
                        <span>Selecione o endereço no mapa</span>
                    </legend>


                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition[0] || selectedPosition[1] 
                            ? selectedPosition 
                            : initialPosition} 
                        />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                             <label htmlFor="zil-code">CEP*</label>
                                <input 
                                    type="text"
                                    name="zip-code"
                                    id="zip-code"
                                    required
                                    onChange={handleInputChange}
                                />
                        </div>

                        <div className="field">
                             <label htmlFor="bairro">Bairro</label>
                                <input 
                                    type="text"
                                    name="bairro"
                                    id="bairro"
                                    onChange={handleInputChange}
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
                                        onChange={handleInputChange}
                                    />
                            </div>

                        <div className="field">
                             <label htmlFor="numero">Número</label>
                                <input 
                                    type="number"
                                    name="numero"
                                    id="numero"
                                    min="0"
                                    onChange={handleInputChange}
                                />
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="uf">Estado</label>
                        <select name="uf" id="uf" onChange={handleSelectedState} required>
                            <option value="0">Selecione um estado*</option>
                            {
                                estados.map(({nome, sigla, id}) => (<option key={id} value={sigla}>{`${sigla} - ${nome}`}</option>))
                            }
                        </select>
                                 
                    </div>
                    
                    <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={handleSelectedState} required>
                            <option value="0">
                           {!loadingCity 
                             ? estado.length 
                                ? `Selecione uma cidade do ${estado}`
                                 : 'Selecione uma cidade*'
                             : `Carregando cidades do ${estado}`
                            }
                         </option>
                            {
                                citys.map(({nome, id}) => (<option key={id} value={nome}>{nome}</option>))
                            }
                        </select>
                    </div>
                    
                </fieldset>
                <fieldset>
                    <legend> 
                        <h2>Itens de Coleta </h2> 
                        <span>Selecione um ou mais itens abaixo*</span>
                    </legend>
                  
                  <ul className="items-grid" onChange={handleSelectedItem}>
                      {
                          collectItems.map(({image_url, title, id}) => 
                          (
                                <li 
                                    key={id} 
                                    className={selectedCollectItem.includes(id) ?  'selected' : ''} 
                                    value={id} 
                                    onClick={handleSelectedItem}
                                >
                                    <img id={id.toString()} src={image_url} alt="item de coleta"/>
                                    <span id={id.toString()}>{title}</span>
                                </li>
                          )
                        )
                      }
                  </ul>
                    
                </fieldset>

                <button type="submit"> {loadingForm ? 'Cadastrando...' : 'Cadastrar ponto de coleta'}</button>
            </form>
        </div>
    )
}

export default CreateCollectPoint;