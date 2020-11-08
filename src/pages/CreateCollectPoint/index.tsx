import React, {useState, useEffect, ChangeEvent} from 'react';
import './styles.css';
import { FiArrowLeft } from 'react-icons/fi';
import logo from '../../assets/logo.png';
import { Link, useHistory } from 'react-router-dom'
import { Map, TileLayer, Marker } from 'react-leaflet';
import {LeafletMouseEvent} from 'leaflet';
import api from '../../services/api';
import axios from 'axios';
import FileDropzone from '../../components/dropzone';


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
    const [selectedFile, setSelectedFile] = useState<File>();
    const [citys, setCitys] = useState<[]>([]);
    const [selectedCollectItem, setSelectedCollectItem] = useState<number[]>([]);
    const [loadingCity, setLoadingCity] = useState<boolean>(false);
    const [loadingForm, setLoadingForm] = useState<boolean>(false);
    const [formData, setFormaData] = useState({
        name: '',
        telephone: '',
        cellphone: '',
        email: '',
        numero: 0,
        rua: '',
        bairro: '',
        "zip-code": '',

    });

    const history = useHistory();

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
    };

    function handleMapClick(event: LeafletMouseEvent) {
        if (!event) {
            return;
        }

        const {latlng} = event;
        console.log([latlng.lat, latlng.lng])
        setSelectedPosition([latlng.lat, latlng.lng]);
    }

    function handleCEP(cep: string) {
        if (cep.length < 8) {
            return;
        }
        axios.get(`https://viacep.com.br/ws/${cep}/json/`)
            .then((response) =>
            {
                if (response.status === 200)
                {
                    const { logradouro, bairro, localidade, uf } = response.data;
                    setFormaData({...formData, bairro, rua: logradouro})
                    setCity(localidade);
                    setEstado(uf);
                }
            })
            .catch(err => {
                console.error(err)
            })
            .finally(() => setLoadingCity(false));
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) =>
    { const {value, name} = event.target;

      if(!value || !name) {
          return;
      }

      if (value === 'zip-code' || name === 'zip-code')
      {
            handleCEP(value.replace(/[^0-9]/g, ''));

      }

      setFormaData({...formData, [name]: value})

    };

    const handleSubmit = (event: any) => {

        event.preventDefault();
        setLoadingForm(true);


        const data = new FormData();

        const {name, email, rua, bairro, numero, telephone, cellphone} = formData;
        const [latitude, longitude] = selectedPosition;

        if (!selectedCollectItem.length) {
            alert('Pelo menos um item de coleta deve ser selecionado');
            setLoadingForm(false);
            return;
        }

        data.append('name',name);
        data.append('email',email);
        data.append('UF', estado);
        data.append('city', city);
        data.append('neighborhood', bairro);
        data.append('street', rua);
        data.append('zip_code', formData['zip-code']);
        data.append('addressNumber', String(numero));
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('telephone', telephone);
        data.append('cellphone', cellphone);
        data.append('items', selectedCollectItem.join(','));

        if (selectedFile) {
            data.append('image', selectedFile);
        }


        api.post('collect_points', data)
        .then((response) =>
        {   console.log(response)
            if (response.status === 200) {
                alert('Ponto de coleta cadastrado com sucesso!');
                history.push('/');
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

                <FileDropzone FileDropzone={setSelectedFile}/>

                <fieldset>
                    <legend> <h2>Dados </h2> </legend>
                    <div className="field">
                        <label htmlFor="name">Nome do Local de Coleta*</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            required
                            onChange={handleInputChange}
                        />
                    </div>

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

                    <div className="field-group">


                       <div className="field">
                        <label htmlFor="telephone">Telefone*</label>
                            <input
                                type="text"
                                name="telephone"
                                id="telephone"
                                required
                                onChange={handleInputChange}
                            />

                        </div>

                       <div className="field">
                        <label htmlFor="cellphone">Celular*</label>
                            <input
                                type="text"
                                name="cellphone"
                                id="cellphone"
                                required
                                onChange={handleInputChange}
                            />

                        </div>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="openDays">Dias de funcionamento*</label>
                            <select name="openDays" id="openDays" onChange={() => {}} multiple required style={{minHeight: '-webkit-fill-available'}}>
                                <option value="Segunda-Feira">Segunda-Feira</option>
                                <option value="Terça-Feira">Terça-Feira</option>
                                <option value="Quarta-Feira">Quarta-Feira</option>
                                <option value="Quinta-Feira">Quinta-Feira</option>
                                <option value="Sexta-Feira">Sexta-Feira</option>
                                <option value="Sábado-Feira">Sábado-Feira</option>
                                <option value="Domingo-Feira">Domingo-Feira</option>
                            </select>
                        </div>

                       <div className="field">
                           <label htmlFor="openHours">Horários de funcionamento*</label>
                           <select name="openHours" id="openHours" onChange={() => {}} multiple required style={{minHeight: '-webkit-fill-available'}}>
                               {Array.from({length: 12}, (t, index: number) => (<option key={index} value={18-index}>{`${18-index}:00`}</option>))}
                           </select>
                        </div>

                        <div className="field">
                            <label htmlFor="freight">Local de coleta reaiza busca de materiais resíduais?</label>
                            <div className="field-group"style={{marginTop: '12px'}}>
                                <div className="field">
                                    <label htmlFor="sim">Sim</label>
                                    <input
                                        type="radio"
                                        name="freight"
                                        id="freight"
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="freight">Não</label>
                                    <input
                                        type="radio"
                                        name="freight"
                                        id="freight"
                                    />
                                </div>
                            </div>
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
                                    value={ formData['zip-code'].replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2')}
                                    required
                                    onChange={handleInputChange}
                                />
                        </div>

                        <div className="field">
                             <label htmlFor="bairro">Bairro*</label>
                                <input
                                    type="text"
                                    name="bairro"
                                    id="bairro"
                                    value={formData.bairro}
                                    required
                                    onChange={handleInputChange}
                                />
                        </div>
                    </div>

                    <div className="field-group">

                    <div className="field">
                                <label htmlFor="rua">Rua*</label>
                                    <input
                                        type="text"
                                        name="rua"
                                        id="rua"
                                        value={formData.rua}
                                        required
                                        onChange={handleInputChange}
                                    />
                            </div>

                        <div className="field">
                             <label htmlFor="numero">Número*</label>
                                <input
                                    type="number"
                                    name="numero"
                                    id="numero"
                                    min="0"
                                    required
                                    onChange={handleInputChange}
                                />
                        </div>
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado*</label>
                            <select name="uf" id="uf" value={estado} onChange={handleSelectedState} required>
                                <option value="0">Selecione um estado*</option>
                                {
                                    estados.map(({nome, sigla, id}) => (<option key={id} value={sigla}>{`${sigla} - ${nome}`}</option>))
                                }
                            </select>

                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade*</label>
                            <select name="city" id="city" value={city} onChange={handleSelectedState} required>
                                <option value="0">
                                    {!loadingCity
                                        ? estado && estado.length
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
